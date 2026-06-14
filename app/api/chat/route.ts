import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

const MAX_MESSAGE_LENGTH = 2000;

const ANONYMOUS_DAILY_LIMIT = 5;
const FREE_DAILY_LIMIT = 10;

const PRIMARY_AI_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const PRIMARY_AI_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

const BACKUP_AI_BASE_URL = process.env.BACKUP_AI_BASE_URL;
const BACKUP_AI_API_KEY = process.env.BACKUP_AI_API_KEY;
const BACKUP_AI_MODEL = process.env.BACKUP_AI_MODEL;

const ALLOWED_TOOLS = new Set([
  "chat",
  "copy",
  "title",
  "ad",
  "code",
  "script",
  "moments",
  "seo",
  "report",
  "rewrite",
]);

const TOOL_SYSTEM_PROMPTS: Record<string, string> = {
  chat:
    "你是 AI Bot Pro 的智能助手，专注于中文问答、资料整理、代码解释和办公效率。请用清晰、实用、适合中文用户的方式回答。不要声称自己是 GPT-4、GPT-3.5 或其他具体模型版本。",
  copy:
    "你是 AI Bot Pro 的文案助手，擅长短视频、小红书、朋友圈、私域和营销文案。请输出能直接复制使用的中文文案，结构清晰，表达有吸引力。",
  title:
    "你是 AI Bot Pro 的标题助手，擅长生成短视频、文章、广告和社交媒体标题。请给出多个有点击欲望但不夸张造假的标题。",
  ad:
    "你是 AI Bot Pro 的广告优化助手，擅长把普通广告词改得更清楚、更有吸引力、更有转化力。请输出可直接使用的广告表达。",
  code:
    "你是 AI Bot Pro 的代码助手，擅长解释报错、梳理代码逻辑、给出安全清晰的修改建议。请尽量用新手能看懂的方式回答。",
  script:
    "你是 AI Bot Pro 的短视频脚本助手，擅长生成口播脚本、开头钩子、分镜思路和结尾引导。请输出适合中文短视频发布的脚本。",
  moments:
    "你是 AI Bot Pro 的朋友圈和私域文案助手，擅长生成自然、不生硬、有转化感的朋友圈、社群和私聊文案。",
  seo:
    "你是 AI Bot Pro 的 SEO 文章助手，擅长生成结构清晰、适合网站和公众号发布的中文文章草稿。",
  report:
    "你是 AI Bot Pro 的办公总结助手，擅长把零散工作内容整理成日报、周报、总结、复盘和汇报。",
  rewrite:
    "你是 AI Bot Pro 的润色改写助手，擅长改写、翻译、润色和优化中文表达。请保持原意，并让表达更自然专业。",
};

type UserPlan = {
  plan: "free" | "pro";
  dailyLimit: number;
};

type AnonymousUsageRecord = {
  date: string;
  count: number;
};

type AiProvider = {
  name: "deepseek" | "backup";
  client: OpenAI;
  model: string;
};

const anonymousUsageMap = new Map<string, AnonymousUsageRecord>();

function createPrimaryAiProvider() {
  if (!process.env.DEEPSEEK_API_KEY) {
    return null;
  }

  return {
    name: "deepseek" as const,
    client: new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: PRIMARY_AI_BASE_URL,
    }),
    model: PRIMARY_AI_MODEL,
  };
}

function createBackupAiProvider() {
  if (!BACKUP_AI_API_KEY || !BACKUP_AI_BASE_URL || !BACKUP_AI_MODEL) {
    return null;
  }

  return {
    name: "backup" as const,
    client: new OpenAI({
      apiKey: BACKUP_AI_API_KEY,
      baseURL: BACKUP_AI_BASE_URL,
    }),
    model: BACKUP_AI_MODEL,
  };
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
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

async function getUserPlan(userId: string): Promise<UserPlan> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("user_plans")
    .select("plan,daily_limit,expired_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("读取用户套餐失败：", error);
    throw new Error("读取用户套餐失败。");
  }

  if (!data) {
    return {
      plan: "free",
      dailyLimit: FREE_DAILY_LIMIT,
    };
  }

  const plan = data.plan === "pro" ? "pro" : "free";
  const dailyLimit = Number(data.daily_limit || FREE_DAILY_LIMIT);
  const expiredAt = data.expired_at ? new Date(data.expired_at) : null;

  if (expiredAt && expiredAt.getTime() <= Date.now()) {
    return {
      plan: "free",
      dailyLimit: FREE_DAILY_LIMIT,
    };
  }

  return {
    plan,
    dailyLimit:
      Number.isFinite(dailyLimit) && dailyLimit > 0
        ? dailyLimit
        : FREE_DAILY_LIMIT,
  };
}

async function getUserUsage(userId: string, limit: number) {
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
    limit,
    remaining: Math.max(limit - used, 0),
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

function validateTool(rawTool: unknown) {
  const tool = String(rawTool || "chat").trim().toLowerCase();

  if (!ALLOWED_TOOLS.has(tool)) {
    return null;
  }

  return tool;
}

function getSystemPrompt(tool: string) {
  return TOOL_SYSTEM_PROMPTS[tool] || TOOL_SYSTEM_PROMPTS.chat;
}

async function parseJsonBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function isFallbackWorthyError(error: unknown) {
  const status = Number(
    (error as { status?: unknown; code?: unknown })?.status ||
      (error as { statusCode?: unknown })?.statusCode ||
      0
  );

  // 429：限流；5xx：上游异常；0：网络错误/超时/未知错误。
  return status === 0 || status === 429 || status >= 500;
}

async function callAiProvider({
  provider,
  tool,
  message,
}: {
  provider: AiProvider;
  tool: string;
  message: string;
}) {
  const completion = await provider.client.chat.completions.create({
    model: provider.model,
    messages: [
      {
        role: "system",
        content: getSystemPrompt(tool),
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
    throw new Error(`${provider.name} 没有返回有效内容。`);
  }

  return {
    reply,
    provider: provider.name,
    model: provider.model,
  };
}

async function callAiWithFallback({
  tool,
  message,
}: {
  tool: string;
  message: string;
}) {
  const primaryProvider = createPrimaryAiProvider();
  const backupProvider = createBackupAiProvider();

  if (!primaryProvider && !backupProvider) {
    throw new Error(
      "服务器未配置 AI 接口。请配置 DEEPSEEK_API_KEY，或配置 BACKUP_AI_BASE_URL / BACKUP_AI_API_KEY / BACKUP_AI_MODEL。"
    );
  }

  if (!primaryProvider && backupProvider) {
    return callAiProvider({
      provider: backupProvider,
      tool,
      message,
    });
  }

  if (!primaryProvider) {
    throw new Error("服务器未配置主 AI 接口。");
  }

  try {
    return await callAiProvider({
      provider: primaryProvider,
      tool,
      message,
    });
  } catch (primaryError) {
    console.error("主 AI 接口调用失败：", primaryError);

    if (!backupProvider || !isFallbackWorthyError(primaryError)) {
      throw primaryError;
    }

    try {
      console.warn("正在切换备用 AI 接口。");

      return await callAiProvider({
        provider: backupProvider,
        tool,
        message,
      });
    } catch (backupError) {
      console.error("备用 AI 接口调用失败：", backupError);
      throw backupError;
    }
  }
}

export async function POST(req: Request) {
  try {
    const hasPrimaryAi = Boolean(process.env.DEEPSEEK_API_KEY);
    const hasBackupAi = Boolean(
      BACKUP_AI_BASE_URL && BACKUP_AI_API_KEY && BACKUP_AI_MODEL
    );

    if (!hasPrimaryAi && !hasBackupAi) {
      return Response.json(
        {
          error:
            "服务器未配置 AI 接口。请配置 DEEPSEEK_API_KEY，或配置 BACKUP_AI_BASE_URL / BACKUP_AI_API_KEY / BACKUP_AI_MODEL。",
        },
        { status: 500 }
      );
    }

    const ip = getClientIp(req);

    const globalIpLimit = checkRateLimit(`chat:global-minute:${ip}`, {
      limit: 20,
      windowMs: 60 * 1000,
    });

    if (!globalIpLimit.allowed) {
      return rateLimitResponse(globalIpLimit.resetAt);
    }

    const body = await parseJsonBody(req);

    if (!body || typeof body !== "object") {
      return Response.json({ error: "请求内容格式不正确。" }, { status: 400 });
    }

    const message = String((body as { message?: unknown }).message || "").trim();
    const tool = validateTool((body as { tool?: unknown }).tool);

    if (!tool) {
      return Response.json({ error: "工具类型不正确。" }, { status: 400 });
    }

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

    if (loginUser) {
      const userMinuteLimit = checkRateLimit(`chat:user-minute:${loginUser.id}`, {
        limit: 12,
        windowMs: 60 * 1000,
      });

      if (!userMinuteLimit.allowed) {
        return rateLimitResponse(userMinuteLimit.resetAt);
      }
    } else {
      const anonymousMinuteLimit = checkRateLimit(`chat:anonymous-minute:${ip}`, {
        limit: 5,
        windowMs: 60 * 1000,
      });

      if (!anonymousMinuteLimit.allowed) {
        return rateLimitResponse(anonymousMinuteLimit.resetAt);
      }
    }

    let usageType: "login" | "anonymous" = "anonymous";
    let plan: "free" | "pro" | "anonymous" = "anonymous";
    let usageKey = "";
    let userId = "";
    let used = 0;
    let limit = ANONYMOUS_DAILY_LIMIT;

    if (loginUser) {
      usageType = "login";
      userId = loginUser.id;

      const userPlan = await getUserPlan(loginUser.id);

      plan = userPlan.plan;
      limit = userPlan.dailyLimit;

      const userUsage = await getUserUsage(loginUser.id, limit);

      used = userUsage.used;

      if (used >= limit) {
        return Response.json(
          {
            error:
              plan === "pro"
                ? "你今天的 Pro 会员次数已经用完。"
                : "你今天的 Free 免费次数已经用完。",
            usage: {
              type: "login",
              plan,
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
              plan: "anonymous",
              used,
              limit,
              remaining: 0,
            },
          },
          { status: 429 }
        );
      }
    }

    const aiResult = await callAiWithFallback({
      tool,
      message,
    });

    let nextUsed = used + 1;

    if (usageType === "login" && userId) {
      nextUsed = await increaseUserUsage(userId, used);
    } else {
      nextUsed = increaseAnonymousUsage(usageKey);
    }

    return Response.json({
      reply: aiResult.reply,
      usage: {
        type: usageType,
        plan,
        used: nextUsed,
        limit,
        remaining: Math.max(limit - nextUsed, 0),
      },
      ai: {
        provider: aiResult.provider,
        model: aiResult.model,
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
