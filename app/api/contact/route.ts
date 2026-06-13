import { Resend } from "resend";

type ContactRequestBody = {
  email?: string;
  type?: string;
  message?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactRequestBody;

    const email = String(body.email || "").trim();
    const type = String(body.type || "").trim();
    const message = String(body.message || "").trim();

    if (!email) {
      return Response.json({ error: "请填写邮箱地址。" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { error: "邮箱格式不正确，请重新填写。" },
        { status: 400 }
      );
    }

    if (!type) {
      return Response.json({ error: "请选择反馈类型。" }, { status: 400 });
    }

    if (!message) {
      return Response.json(
        { error: "请填写具体反馈内容。" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return Response.json(
        { error: "反馈内容太长了，最多 1000 个字。" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || "AI Bot Pro <noreply@aibotpro.top>";

    const createdAt = new Date().toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour12: false,
    });

    console.log("AI Bot Pro 联系表单提交：", {
      email,
      type,
      message,
      createdAt,
    });

    if (!resendApiKey || !toEmail) {
      console.warn("联系表单邮件未发送：缺少 RESEND_API_KEY 或 CONTACT_TO_EMAIL。");

      return Response.json({
        success: true,
        message:
          "提交成功，我们已经收到你的反馈。当前未配置邮箱通知，内容已记录在服务端日志中。",
      });
    }

    const resend = new Resend(resendApiKey);

    const safeEmail = escapeHtml(email);
    const safeType = escapeHtml(type);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
    const safeCreatedAt = escapeHtml(createdAt);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `AI Bot Pro 新反馈：${type}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #111; max-width: 680px;">
          <h2 style="margin-bottom: 16px;">AI Bot Pro 收到新的联系表单</h2>

          <div style="padding: 16px; background: #f7f7f7; border-radius: 12px; margin-bottom: 16px;">
            <p><strong>提交时间：</strong>${safeCreatedAt}</p>
            <p><strong>用户邮箱：</strong>${safeEmail}</p>
            <p><strong>反馈类型：</strong>${safeType}</p>
          </div>

          <div style="padding: 16px; background: #f5f5f5; border-radius: 12px;">
            <strong>具体内容：</strong>
            <p>${safeMessage}</p>
          </div>

          <p style="margin-top: 24px; color: #666; font-size: 13px;">
            这封邮件来自 AI Bot Pro 联系我们页面。
          </p>
        </div>
      `,
      text: `
AI Bot Pro 收到新的联系表单

提交时间：${createdAt}
用户邮箱：${email}
反馈类型：${type}

具体内容：
${message}
      `,
    });

    if (error) {
      console.error("Resend 联系表单邮件发送失败：", error);

      return Response.json(
        {
          error: "反馈已收到，但邮件通知发送失败。请稍后再试。",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "提交成功，我们已经收到你的反馈，并已发送邮件通知。",
    });
  } catch (error) {
    console.error("联系表单提交失败：", error);

    return Response.json(
      { error: "提交失败，请稍后再试。" },
      { status: 500 }
    );
  }
}