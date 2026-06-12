import OpenAI from "openai";

const DAILY_LIMIT = 5;
const MAX_MESSAGE_LENGTH = 2000;

type UsageRecord = {
  date: string;
  count: number;
};

const ipUsageMap = new Map<string, UsageRecord>();

const toolPrompts: Record<string, string> = {
  chat: "你是 AI Bot Pro 的智能助手。你要用简洁、清晰、实用的方式回答用户问题，适合中文用户使用。",

  copy: "你是一个短视频爆款文案专家，擅长抖音、小红书、朋友圈文案。你要帮用户生成有吸引力、有情绪、有点击欲望的文案。内容要接地气，不要太像AI。",

  title: "你是一个爆款标题生成专家，擅长生成抖音、小红书、公众号、广告标题。标题要短、有冲突感、有好奇心、有点击欲望。",

  ad: "你是一个广告转化优化专家，擅长把普通广告词优化得更有吸引力、更有销售感、更适合投放。输出多个版本供用户选择。",

  code: "你是一个代码助手，擅长解释报错、修改前端页面、优化代码。你要尽量用小白能看懂的话解释，并给出可以直接复制使用的代码。",

  script: "你是一个短视频脚本专家，擅长生成短视频标题、开头钩子、口播脚本、分镜建议和结尾引导。内容要适合抖音、小红书、视频号。",

  moments: "你是一个朋友圈文案专家，擅长生成自然、不生硬、适合朋友圈和私域转化的文案。文案要像真人发的，不要太像广告。",

  seo: "你是一个 SEO 文章写作专家，擅长生成适合网站、公众号、博客发布的结构化文章。文章要清晰、有层次、适合搜索收录。",

  report: "你是一个办公汇报助手，擅长把用户输入的零散工作内容整理成正式的日报、周报、项目总结。表达要专业、清楚、适合发给老板或客户。",

  rewrite: "你是一个文本润色和翻译助手，擅长改写、润色、优化表达和翻译。你要保留原意，让表达更自然、更专业。",
};

function getToday() {
  return new Date().toLocaleDateString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfIp = req.headers.get("cf-connecting-ip");

  if (cfIp) {
    return cfIp;
  }

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function getIpUsage(ip: string) {
  const today = getToday();
  const record = ipUsageMap.get(ip);

  if (!record || record.date !== today) {
    ipUsageMap.set(ip, {
      date: today,
      count: 0,
    });

    return 0;
  }

  return record.count;
}

function increaseIpUsage(ip: string) {
  const today = getToday();
  const current = ipUsageMap.get(ip);

  if (!current || current.date !== today) {
    ipUsageMap.set(ip, {
      date: today,
      count: 1,
    });

    return 1;
  }

  const nextCount = current.count + 1;

  ipUsageMap.set(ip, {
    date: today,
    count: nextCount,
  });

  return nextCount;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "服务器未配置 DEEPSEEK_API_KEY，请检查 .env.local 文件。",
        },
        { status: 500 }
      );
    }

    const ip = getClientIp(req);
    const currentUsage = getIpUsage(ip);

    if (currentUsage >= DAILY_LIMIT) {
      return Response.json(
        {
          error: `今日免费次数已用完。免费版每天最多使用 ${DAILY_LIMIT} 次，请明天再来。`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const message = body?.message;
    const tool = body?.tool || "chat";

    if (!message || typeof message !== "string" || !message.trim()) {
      return Response.json(
        {
          error: "请输入有效的问题内容。",
        },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        {
          error: `输入内容太长了，免费版每次最多输入 ${MAX_MESSAGE_LENGTH} 个字，请精简后再试。`,
        },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: toolPrompts[tool] || toolPrompts.chat,
        },
        {
          role: "user",
          content: cleanMessage,
        },
      ],
      temperature: tool === "code" ? 0.4 : 0.8,
      max_tokens: 1500,
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        {
          error: "AI 没有返回内容，请重新试一次。",
        },
        { status: 502 }
      );
    }

    const used = increaseIpUsage(ip);

    return Response.json({
      reply,
      usage: {
        used,
        limit: DAILY_LIMIT,
        remaining: Math.max(DAILY_LIMIT - used, 0),
      },
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);

    const err = error as {
      message?: string;
      status?: number;
      error?: {
        message?: string;
      };
    };

    const rawMessage = err?.error?.message || err?.message || "";

    let friendlyMessage = "AI 接口请求失败，请稍后重试。";

    if (rawMessage.includes("Insufficient Balance")) {
      friendlyMessage = "DeepSeek 余额不足，请先充值后再使用。";
    }

    if (
      rawMessage.includes("401") ||
      rawMessage.toLowerCase().includes("api key") ||
      rawMessage.toLowerCase().includes("authentication")
    ) {
      friendlyMessage = "API Key 无效，请检查 DEEPSEEK_API_KEY 是否正确。";
    }

    if (
      rawMessage.toLowerCase().includes("rate limit") ||
      rawMessage.includes("429")
    ) {
      friendlyMessage = "请求太频繁了，请稍后再试。";
    }

    return Response.json(
      {
        error: friendlyMessage,
        detail:
          process.env.NODE_ENV === "development" ? rawMessage : undefined,
      },
      { status: 500 }
    );
  }
}