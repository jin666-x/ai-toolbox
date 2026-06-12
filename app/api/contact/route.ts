type ContactRequestBody = {
  email?: string;
  type?: string;
  message?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactRequestBody;

    const email = String(body.email || "").trim();
    const type = String(body.type || "").trim();
    const message = String(body.message || "").trim();

    if (!email) {
      return Response.json(
        {
          error: "请填写邮箱地址。",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return Response.json(
        {
          error: "邮箱格式不正确，请重新填写。",
        },
        { status: 400 }
      );
    }

    if (!type) {
      return Response.json(
        {
          error: "请选择反馈类型。",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return Response.json(
        {
          error: "请填写具体反馈内容。",
        },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return Response.json(
        {
          error: "反馈内容太长了，最多 1000 个字。",
        },
        { status: 400 }
      );
    }

    console.log("AI Bot Pro 联系表单提交：", {
      email,
      type,
      message,
      createdAt: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: "提交成功，我们已经收到你的反馈。",
    });
  } catch (error) {
    console.error("联系表单提交失败：", error);

    return Response.json(
      {
        error: "提交失败，请稍后再试。",
      },
      { status: 500 }
    );
  }
}