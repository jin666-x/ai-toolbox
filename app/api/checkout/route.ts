import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

type CheckoutRequestBody = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  plan?: unknown;
  paymentMethod?: unknown;
  paymentProof?: unknown;
  message?: unknown;
  userId?: unknown;
};

const SITE_URL = "https://aibotpro.top";

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

function safeSubjectPart(value: string) {
  return value.replace(/[\r\n]/g, " ").slice(0, 80);
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extractUrls(value: string) {
  const matches = value.match(
    /https?:\/\/[^\s"'<>]+|\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp)/gi
  );

  return (matches || []).map((item) =>
    item.replace(/[，。；;,.]+$/g, "").trim()
  );
}

function isAllowedUrl(value: string) {
  if (value.startsWith("/")) {
    return !value.startsWith("//") && !/\s/.test(value);
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function hasInvalidUrls(value: string) {
  const urls = extractUrls(value);
  return urls.some((url) => !isAllowedUrl(url));
}

function isImageUrl(value: string) {
  const cleanValue = value.split("?")[0].toLowerCase();

  return (
    cleanValue.endsWith(".png") ||
    cleanValue.endsWith(".jpg") ||
    cleanValue.endsWith(".jpeg") ||
    cleanValue.endsWith(".webp") ||
    value.includes("/storage/v1/object/public/payment-proofs/")
  );
}

function normalizeUrl(url: string) {
  if (url.startsWith("/")) {
    return `${SITE_URL}${url}`;
  }

  return url;
}

async function parseJsonBody(req: Request) {
  try {
    return (await req.json()) as CheckoutRequestBody;
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

async function sendAdminCheckoutEmail(params: {
  applicationId: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  paymentMethod: string;
  paymentProof: string;
  message: string;
  userId: string | null;
  createdAt: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "AI Bot Pro <noreply@aibotpro.top>";

  if (!resendApiKey || !toEmail) {
    console.warn("付款确认邮件未发送：缺少 RESEND_API_KEY 或 CONTACT_TO_EMAIL。");

    return {
      sent: false,
      reason: "缺少 RESEND_API_KEY 或 CONTACT_TO_EMAIL",
    };
  }

  try {
    const resend = new Resend(resendApiKey);

    const imageUrls = extractUrls(params.paymentProof)
      .map((url) => normalizeUrl(url))
      .filter((url) => isAllowedUrl(url))
      .filter((url) => isImageUrl(url));

    const allUrls = extractUrls(params.paymentProof)
      .map((url) => normalizeUrl(url))
      .filter((url) => isAllowedUrl(url));

    const safeName = escapeHtml(params.name);
    const safeEmail = escapeHtml(params.email);
    const safeCompany = escapeHtml(params.company || "未填写");
    const safePlan = escapeHtml(params.plan);
    const safePaymentMethod = escapeHtml(params.paymentMethod);
    const safePaymentProof = escapeHtml(params.paymentProof).replaceAll(
      "\n",
      "<br />"
    );
    const safeUserId = escapeHtml(params.userId || "未登录 / 未获取到用户 ID");
    const safeMessage = escapeHtml(params.message || "未填写").replaceAll(
      "\n",
      "<br />"
    );
    const safeCreatedAt = escapeHtml(params.createdAt);
    const adminUrl = `${SITE_URL}/admin/submissions`;

    const screenshotHtml =
      imageUrls.length > 0
        ? `
          <div style="padding: 16px; background: #eff6ff; border-radius: 12px; margin-bottom: 16px;">
            <strong>付款截图预览：</strong>
            ${imageUrls
              .map(
                (url) => `
                  <div style="margin-top: 12px;">
                    <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">
                      <img src="${escapeHtml(url)}" alt="付款截图" style="display: block; width: 100%; max-width: 420px; border-radius: 12px; border: 1px solid #dbeafe;" />
                    </a>
                    <p style="word-break: break-all; font-size: 12px; color: #2563eb;">
                      <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>
                    </p>
                  </div>
                `
              )
              .join("")}
          </div>
        `
        : "";

    const linksHtml =
      allUrls.length > 0
        ? `
          <div style="padding: 16px; background: #f8fafc; border-radius: 12px; margin-bottom: 16px;">
            <strong>相关链接：</strong>
            ${allUrls
              .map(
                (url) =>
                  `<p style="word-break: break-all;"><a href="${escapeHtml(
                    url
                  )}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></p>`
              )
              .join("")}
          </div>
        `
        : "";

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `AI Bot Pro 新的付款确认：${safeSubjectPart(params.plan)}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.75; color: #111827; max-width: 720px; margin: 0 auto;">
          <div style="padding: 24px; background: #111827; color: #fff; border-radius: 18px;">
            <div style="display: inline-block; padding: 7px 12px; border-radius: 999px; background: rgba(16,185,129,.18); color: #a7f3d0; font-size: 13px; font-weight: 700;">
              新的付款确认
            </div>
            <h2 style="margin: 16px 0 0;">AI Bot Pro 收到新的付款确认</h2>
          </div>

          <div style="padding: 16px; background: #f7f7f7; border-radius: 12px; margin: 16px 0;">
            <p><strong>提交时间：</strong>${safeCreatedAt}</p>
            <p><strong>申请 ID：</strong>${escapeHtml(params.applicationId)}</p>
            <p><strong>用户 ID：</strong>${safeUserId}</p>
            <p><strong>称呼：</strong>${safeName}</p>
            <p><strong>邮箱：</strong>${safeEmail}</p>
            <p><strong>微信 / 公司 / 团队：</strong>${safeCompany}</p>
            <p><strong>申请套餐：</strong>${safePlan}</p>
            <p><strong>付款方式：</strong>${safePaymentMethod}</p>
          </div>

          ${screenshotHtml}
          ${linksHtml}

          <div style="padding: 16px; background: #f5f5f5; border-radius: 12px; margin-bottom: 16px;">
            <strong>付款凭证：</strong>
            <p>${safePaymentProof}</p>
          </div>

          <div style="padding: 16px; background: #f5f5f5; border-radius: 12px;">
            <strong>补充说明：</strong>
            <p>${safeMessage}</p>
          </div>

          <div style="margin: 22px 0;">
            <a href="${adminUrl}" style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #111827; color: #fff; text-decoration: none; font-weight: 700;">
              进入后台审核
            </a>
          </div>

          <p style="margin-top: 24px; color: #666; font-size: 13px;">
            这封邮件来自 AI Bot Pro 付款确认页面，内容已同步保存到 Supabase。
          </p>
        </div>
      `,
      text: `AI Bot Pro 收到新的付款确认

提交时间：${params.createdAt}
申请 ID：${params.applicationId}
用户 ID：${params.userId || "未登录 / 未获取到用户 ID"}
称呼：${params.name}
邮箱：${params.email}
微信 / 公司 / 团队：${params.company || "未填写"}
申请套餐：${params.plan}
付款方式：${params.paymentMethod}

付款凭证：
${params.paymentProof}

补充说明：
${params.message || "未填写"}

后台审核：
${adminUrl}
`,
    });

    if (error) {
      console.error("Resend 付款确认邮件发送失败：", error);

      return {
        sent: false,
        reason: "Resend 发送失败",
      };
    }

    return {
      sent: true,
    };
  } catch (error) {
    console.error("发送付款确认邮件异常：", error);

    return {
      sent: false,
      reason: "邮件发送异常",
    };
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const minuteLimit = checkRateLimit(`checkout:minute:${ip}`, {
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!minuteLimit.allowed) {
      return rateLimitResponse(minuteLimit.resetAt);
    }

    const hourLimit = checkRateLimit(`checkout:hour:${ip}`, {
      limit: 20,
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
    const paymentMethod = cleanText(body.paymentMethod);
    const paymentProof = cleanText(body.paymentProof);
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

    if (!paymentMethod) {
      return Response.json({ error: "请选择付款方式。" }, { status: 400 });
    }

    if (paymentMethod.length > 80 || hasUnsafeHtmlChars(paymentMethod)) {
      return Response.json({ error: "付款方式格式不正确。" }, { status: 400 });
    }

    if (!paymentProof) {
      return Response.json(
        { error: "请上传付款截图，或填写付款凭证说明。" },
        { status: 400 }
      );
    }

    if (paymentProof.length > 1500) {
      return Response.json(
        { error: "付款凭证内容太长了，最多 1500 个字。" },
        { status: 400 }
      );
    }

    if (hasUnsafeHtmlChars(paymentProof)) {
      return Response.json(
        { error: "付款凭证不能包含 < 或 > 字符。" },
        { status: 400 }
      );
    }

    if (hasInvalidUrls(paymentProof)) {
      return Response.json(
        { error: "付款凭证里的链接格式不正确。" },
        { status: 400 }
      );
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

    const useCase = `付款确认 - ${paymentMethod}`;

    const fullMessage = [
      "【付款确认】",
      `付款方式：${paymentMethod}`,
      `付款凭证：${paymentProof}`,
      message ? `补充说明：${message}` : "补充说明：未填写",
    ].join("\n");

    const supabase = createAdminClient();

    const { data: insertedApplication, error: dbError } = await supabase
      .from("pro_applications")
      .insert({
        user_id: userId || null,
        name,
        email,
        company: company || null,
        plan,
        use_case: useCase,
        message: fullMessage,
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError || !insertedApplication) {
      console.error("保存付款确认到数据库失败：", dbError);

      return Response.json(
        { error: "提交失败，数据库保存失败，请稍后再试。" },
        { status: 500 }
      );
    }

    const emailResult = await sendAdminCheckoutEmail({
      applicationId: insertedApplication.id,
      name,
      email,
      company,
      plan,
      paymentMethod,
      paymentProof,
      message,
      userId,
      createdAt,
    });

    return Response.json({
      success: true,
      message: emailResult.sent
        ? "提交成功，我们已经收到你的付款确认，并已通知管理员审核。"
        : "提交成功，我们已经收到你的付款确认，请等待人工审核。",
      applicationId: insertedApplication.id,
      adminEmailSent: emailResult.sent,
    });
  } catch (error) {
    console.error("付款确认提交失败：", error);

    return Response.json(
      { error: "提交失败，请稍后再试。" },
      { status: 500 }
    );
  }
}
