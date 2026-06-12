import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_MESSAGE_LENGTH = 2000;

const ANONYMOUS_DAILY_LIMIT = 5;
const LOGIN_DAILY_LIMIT = 10;

type AnonymousUsageRecord = {
  date: string;
  count: number;
};

const anonymousUsageMap = new Map<string, AnonymousUsageRecord>();

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function getAnonymousUsage(req: Request) {
  const today = getTodayDate();
  const ip = getClientIp(req);
  const key = `${ip}:${today}`;

  const record = anonymousUsageMap.get(key);

  if (!record || record.date !== today) {
    anonymousUsageMap.set(key, {
      date: today,
      count: 0,
    });

    return {
      key,
      used: 0,
      limit: ANONYMOUS_DAILY_LIMIT,
      remaining: ANONYMOUS_DAILY_LIMIT,
    };
  }

  return {
    key,
    used: record.count,
    limit: ANONYMOUS_DAILY_LIMIT,
    remaining: Math.max(ANONYMOUS_DAILY_LIMIT - record.count, 0),
  };
}

function increaseAnonymousUsage(key: string) {
  const today = getTodayDate();
  const record = anonymousUsageMap.get(key);

  if (!record || record.date !== today) {
    anonymousUsageMap.set(key, {
      date: today,
      count: 1,
    });

    return 1;
  }

  const nextCount = record.count + 1;

  anonymousUsageMap.set(key, {
    date: today,
    count: nextCount,
  });

  return nextCount;
}

async function getLoginUser(req: Request) {
  const authorization = req.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization.replace("Bearer ", "").trim();

  if (!accessToken) {
    return null;
  }

  const supabase = createAdminClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}

async function getUserUsage(userId: string) {
  const supabase = createAdminClient();
  const today = getTodayDate();

  const { data, error } = await supabase
    .from("user_daily_usage")
    .select("used_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  if (error) {
    console.error("读取用户使用次数失败：", error);
    throw new Error("读取用户使用次数失败。");
  }

  const used = data?.used_count || 0;

  return {
    userId,
    date: today,
    used,
    limit: LOGIN_DAILY_LIMIT,
    remaining: Math.max(LOGIN_DAILY_LIMIT - used, 0),
  };
}

async function increaseUserUsage(userId: string, currentUsed: number) {
  const supabase = createAdminClient();
  const today = getTodayDate();
  const nextUsed = currentUsed + 1;

  const { error } = await supabase.from("user_daily_usage").upsert(
    {
      user_id: userId,
      usage_date: today,
      used_count: nextUsed,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,usage_date",
    }
  );

  if (error) {
    console.error("更新用户使用次数失败：", error);
    throw new Error("更新用户使用次数失败。");
  }

  return nextUsed;
}

export async function POST(req: Request) {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json(
        { error: "服务器未配置 DEEPSEEK_API_KEY。" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return Response.json({ error: "请输入内容。" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        { error: `内容太长了，最多 ${MAX_MESSAGE_LENGTH} 个字符。` },
        { status: 400 }
      );
    }

    const loginUser = await getLoginUser(req);

    let usageType: "login" | "anonymous" = "anonymous";
    let usageKey = "";
    let userId = "";
    let used = 0;
    let limit = ANONYMOUS_DAILY_LIMIT;

    if (loginUser) {
      usageType = "login";
      userId = loginUser.id;

      const userUsage = await getUserUsage(loginUser.id);

      used = userUsage.used;
      limit = userUsage.limit;

      if (used >= limit) {
        return Response.json(
          {
            error: "你今天的登录账号免费次数已经用完。",
            usage: {
              type: "login",
              used,
              limit,
              remaining: 0,
            },
          },
          { status: 429 }
        );
      }
    } else {
      const anonymousUsage = getAnonymousUsage(req);

      usageKey = anonymousUsage.key;
      used = anonymousUsage.used;
      limit = anonymousUsage.limit;

      if (used >= limit) {
        return Response.json(
          {
            error: "你今天的免费体验次数已经用完，请登录账号或申请 Pro。",
            usage: {
              type: "anonymous",
              used,
              limit,
              remaining: 0,
            },
          },
          { status: 429 }
        );
      }
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是 AI Bot Pro 的智能助手，请用清晰、实用、适合中文用户的方式回答。",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return Response.json(
        { error: "AI 暂时没有返回内容，请稍后再试。" },
        { status: 500 }
      );
    }

    let nextUsed = used + 1;

    if (usageType === "login" && userId) {
      nextUsed = await increaseUserUsage(userId, used);
    } else {
      nextUsed = increaseAnonymousUsage(usageKey);
    }

    return Response.json({
      reply,
      usage: {
        type: usageType,
        used: nextUsed,
        limit,
        remaining: Math.max(limit - nextUsed, 0),
      },
    });
  } catch (error) {
    console.error("AI 接口错误：", error);

    return Response.json(
      { error: "AI 服务暂时异常，请稍后再试。" },
      { status: 500 }
    );
  }
}