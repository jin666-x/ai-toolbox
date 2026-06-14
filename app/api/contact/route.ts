import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

type ContactRequestBody = {
  email?: unknown;
  type?: unknown;
  message?: unknown;
};

function isValidEmail(email: string) {
  return (
    email.length <= 254 &&
    !/[\r\n]/.test(email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function hasUnsafeHtmlChars(value: string) {
  return /[<>]/.test(value);
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeSubjectPart(value: string) {
  return value.replace(/[\r\n]/g, " ").slice(0, 80);
}

async function parseJsonBody(req: Request) {
  try {
    return (await req.json()) as ContactRequestBody;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const minuteLimit = checkRateLimit(`contact:minute:${ip}`, {
      limit: 3,
      windowMs: 60 * 1000,
    });

    if (!minuteLimit.allowed) {
      return rateLimitResponse(minuteLimit.resetAt);
    }

    const hourLimit = checkRateLimit(`contact:hour:${ip}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });

    if (!hourLimit.allowed) {
      return rateLimitResponse(hourLimit.resetAt);
    }

    const body = await parseJsonBody(req);

    if (!body) {
      return Response.json({ error: "请求内容格式不正确。" }, { status: 400 });
    }

    const email = cleanText(body.email).toLowerCase();
    const type = cleanText(body.type);
    const message = cleanText(body.message);

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

    if (type.length > 50 || hasUnsafeHtmlChars(type)) {
      return Response.json(
        { error: "反馈类型格式不正确。" },
        { status: 400 }
      );
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

    if (hasUnsafeHtmlChars(message)) {
      return Response.json(
        { error: "反馈内容不能包含 < 或 > 字符。" },
        { status: 400 }
      );
    }

    const createdAt = new Date().toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour12: false,
    });

    const supabase = createAdminClient();

    const { error: dbError } = await supabase.from("contact_messages").insert({
      email,
      type,
      message,
    });

    if (dbError) {
      console.error("保存联系反馈到数据库失败：", dbError);

      return Response.json(
        { error: "提交失败，数据库保存失败，请稍后再试。" },
        { status: 500 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || "AI Bot Pro <noreply@aibotpro.top>";

    if (!resendApiKey || !toEmail) {
      console.warn("联系表单邮件未发送：缺少 RESEND_API_KEY 或 CONTACT_TO_EMAIL。");

      return Response.json({
        success: true,
        message: "提交成功，我们已经收到你的反馈。",
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
      subject: `AI Bot Pro 新反馈：${safeSubjectPart(type)}`,
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
            这封邮件来自 AI Bot Pro 联系我们页面，内容已同步保存到 Supabase。
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

      return Response.json({
        success: true,
        message: "提交成功，我们已经收到你的反馈。",
      });
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
