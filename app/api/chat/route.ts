import OpenAI from "openai";

const toolPrompts: Record<string, string> = {
  chat: "你是 AI Bot Pro 的智能助手。你要用简洁、清晰、实用的方式回答用户问题，适合中文用户使用。",

  copy: "你是一个短视频爆款文案专家，擅长抖音、小红书、朋友圈文案。你要帮用户生成有吸引力、有情绪、有点击欲望的文案。内容要接地气，不要太像AI。",

  title: "你是一个爆款标题生成专家，擅长生成抖音、小红书、公众号、广告标题。标题要短、有冲突感、有好奇心、有点击欲望。",

  ad: "你是一个广告转化优化专家，擅长把普通广告词优化得更有吸引力、更有销售感、更适合投放。输出多个版本供用户选择。",

  code: "你是一个代码助手，擅长解释报错、修改前端页面、优化代码。你要尽量用小白能看懂的话解释，并给出可以直接复制使用的代码。",
};

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
          content: message.trim(),
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

    return Response.json({
      reply,
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