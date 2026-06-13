import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

type WaitlistRequestBody = {
  name?: string;
  email?: string;
  company?: string;
  plan?: string;
  useCase?: string;
  message?: string;
  userId?: string | null;
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
    const body = (await req.json()) as WaitlistRequestBody;

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const company = String(body.company || "").trim();
    const plan = String(body.plan || "").trim();
    const useCase = String(body.useCase || "").trim();
    const message = String(body.message || "").trim();
    const userId = body.userId ? String(body.userId).trim() : null;

    if (!name) {
      return Response.json({ error: "请填写你的称呼。" }, { status: 400 });
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

    if (!plan) {
      return Response.json({ error: "请选择想开通的套餐。" }, { status: 400 });
    }

    if (!useCase) {
      return Response.json({ error: "请选择主要使用场景。" }, { status: 400 });
    }

    if (message.length > 1500) {
      return Response.json(
        { error: "补充说明太长了，最多 1500 个字。" },
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
      subject: `AI Bot Pro 新的 Pro 申请：${plan}`,
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