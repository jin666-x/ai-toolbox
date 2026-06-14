import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

type WaitlistRequestBody = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  plan?: unknown;
  useCase?: unknown;
  message?: unknown;
  userId?: unknown;
};

function isValidEmail(email: string) {
  return (
    email.length <= 254 &&
    !/[\r\n]/.test(email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
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
    return (await req.json()) as WaitlistRequestBody;
  } catch {
    return null;
  }
}

async function getVerifiedUserId(req: Request) {
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

  if (error || !user?.id) {
    return null;
  }

  return user.id;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const minuteLimit = checkRateLimit(`waitlist:minute:${ip}`, {
      limit: 3,
      windowMs: 60 * 1000,
    });

    if (!minuteLimit.allowed) {
      return rateLimitResponse(minuteLimit.resetAt);
    }

    const hourLimit = checkRateLimit(`waitlist:hour:${ip}`, {
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });

    if (!hourLimit.allowed) {
      return rateLimitResponse(hourLimit.resetAt);
    }

    const body = await parseJsonBody(req);

    if (!body) {
      return Response.json({ error: "请求内容格式不正确。" }, { status: 400 });
    }

    const name = cleanText(body.name);
    const email = cleanText(body.email).toLowerCase();
    const company = cleanText(body.company);
    const plan = cleanText(body.plan);
    const useCase = cleanText(body.useCase);
    const message = cleanText(body.message);
    const bodyUserId = cleanText(body.userId);
    const verifiedUserId = await getVerifiedUserId(req);
    const userId = verifiedUserId || (isUuidLike(bodyUserId) ? bodyUserId : null);

    if (!name) {
      return Response.json({ error: "请填写你的称呼。" }, { status: 400 });
    }

    if (name.length > 60 || hasUnsafeHtmlChars(name)) {
      return Response.json({ error: "称呼格式不正确。" }, { status: 400 });
    }

    if (!email) {
      return Response.json({ error: "请填写邮箱地址。" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { error: "邮箱格式不正确，请重新填写。" },
        { status: 400 }
      );
    }

    if (company.length > 120 || hasUnsafeHtmlChars(company)) {
      return Response.json(
        { error: "微信 / 公司 / 团队信息格式不正确。" },
        { status: 400 }
      );
    }

    if (!plan) {
      return Response.json({ error: "请选择想开通的套餐。" }, { status: 400 });
    }

    if (plan.length > 80 || hasUnsafeHtmlChars(plan)) {
      return Response.json({ error: "套餐格式不正确。" }, { status: 400 });
    }

    if (!useCase) {
      return Response.json({ error: "请选择主要使用场景。" }, { status: 400 });
    }

    if (useCase.length > 120 || hasUnsafeHtmlChars(useCase)) {
      return Response.json({ error: "使用场景格式不正确。" }, { status: 400 });
    }

    if (message.length > 1500) {
      return Response.json(
        { error: "补充说明太长了，最多 1500 个字。" },
        { status: 400 }
      );
    }

    if (hasUnsafeHtmlChars(message)) {
      return Response.json(
        { error: "补充说明不能包含 < 或 > 字符。" },
        { status: 400 }
      );
    }

    const createdAt = new Date().toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour12: false,
    });

    const supabase = createAdminClient();

    const { error: dbError } = await supabase.from("pro_applications").insert({
      user_id: userId || null,
      name,
      email,
      company: company || null,
      plan,
      use_case: useCase,
      message: message || null,
      status: "pending",
    });

    if (dbError) {
      console.error("保存 Pro 申请到数据库失败：", dbError);

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
      console.warn("Pro 申请邮件未发送：缺少 RESEND_API_KEY 或 CONTACT_TO_EMAIL。");

      return Response.json({
        success: true,
        message: "提交成功，我们已经收到你的 Pro 申请。",
      });
    }

    const resend = new Resend(resendApiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company || "未填写");
    const safePlan = escapeHtml(plan);
    const safeUseCase = escapeHtml(useCase);
    const safeUserId = escapeHtml(userId || "未登录 / 未获取到用户 ID");
    const safeMessage = escapeHtml(message || "未填写").replaceAll(
      "\n",
      "<br />"
    );
    const safeCreatedAt = escapeHtml(createdAt);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `AI Bot Pro 新的 Pro 申请：${safeSubjectPart(plan)}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #111; max-width: 680px;">
          <h2 style="margin-bottom: 16px;">AI Bot Pro 收到新的 Pro 会员申请</h2>

          <div style="padding: 16px; background: #f7f7f7; border-radius: 12px; margin-bottom: 16px;">
            <p><strong>提交时间：</strong>${safeCreatedAt}</p>
            <p><strong>用户 ID：</strong>${safeUserId}</p>
            <p><strong>称呼：</strong>${safeName}</p>
            <p><strong>邮箱：</strong>${safeEmail}</p>
            <p><strong>微信 / 公司 / 团队：</strong>${safeCompany}</p>
            <p><strong>申请套餐：</strong>${safePlan}</p>
            <p><strong>使用场景：</strong>${safeUseCase}</p>
          </div>

          <div style="padding: 16px; background: #f5f5f5; border-radius: 12px;">
            <strong>补充说明：</strong>
            <p>${safeMessage}</p>
          </div>

          <p style="margin-top: 24px; color: #666; font-size: 13px;">
            这封邮件来自 AI Bot Pro Pro 申请页面，内容已同步保存到 Supabase。
          </p>
        </div>
      `,
      text: `
AI Bot Pro 收到新的 Pro 会员申请

提交时间：${createdAt}
用户 ID：${userId || "未登录 / 未获取到用户 ID"}
称呼：${name}
邮箱：${email}
微信 / 公司 / 团队：${company || "未填写"}
申请套餐：${plan}
使用场景：${useCase}

补充说明：
${message || "未填写"}
      `,
    });

    if (error) {
      console.error("Resend Pro 申请邮件发送失败：", error);

      return Response.json({
        success: true,
        message: "提交成功，我们已经收到你的 Pro 申请。",
      });
    }

    return Response.json({
      success: true,
      message: "提交成功，我们已经收到你的 Pro 申请，并已发送邮件通知。",
    });
  } catch (error) {
    console.error("Pro 申请提交失败：", error);

    return Response.json(
      { error: "提交失败，请稍后再试。" },
      { status: 500 }
    );
  }
}
