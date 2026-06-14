import { writeAdminAuditLog } from "@/lib/admin-audit-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

type ProApplication = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  company: string | null;
  plan: string;
  use_case: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const SITE_URL = "https://aibotpro.top";

function getExpiredAt(planText: string) {
  const now = new Date();

  if (planText.includes("年")) {
    now.setDate(now.getDate() + 365);
    return now.toISOString();
  }

  if (planText.includes("试用")) {
    now.setDate(now.getDate() + 7);
    return now.toISOString();
  }

  if (planText.includes("月")) {
    now.setDate(now.getDate() + 30);
    return now.toISOString();
  }

  return null;
}

function getAmountCents(planText: string) {
  if (planText.includes("年")) {
    return 19900;
  }

  if (planText.includes("月")) {
    return 1990;
  }

  return 0;
}

function formatExpiredAt(value: string | null) {
  if (!value) {
    return "长期有效 / 暂未设置到期时间";
  }

  try {
    return new Date(value).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour12: false,
    });
  } catch {
    return value;
  }
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendProApprovedEmail(params: {
  email: string;
  name: string;
  plan: string;
  dailyLimit: number;
  expiredAt: string | null;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "AI Bot Pro <noreply@aibotpro.top>";

  if (!resendApiKey) {
    console.warn("Pro 开通通知邮件未发送：缺少 RESEND_API_KEY。");

    return {
      sent: false,
      reason: "缺少 RESEND_API_KEY",
    };
  }

  try {
    const resend = new Resend(resendApiKey);

    const safeName = escapeHtml(params.name || "用户");
    const safePlan = escapeHtml(params.plan);
    const safeDailyLimit = escapeHtml(String(params.dailyLimit));
    const safeExpiredAt = escapeHtml(formatExpiredAt(params.expiredAt));

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [params.email],
      subject: "你的 AI Bot Pro 会员已开通",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.75; color: #111827; max-width: 680px; margin: 0 auto;">
          <div style="padding: 28px; border-radius: 20px; background: #0b0b0f; color: #fff;">
            <div style="display: inline-block; padding: 8px 12px; border-radius: 999px; background: rgba(16,185,129,.16); color: #a7f3d0; font-size: 13px; font-weight: 700;">
              Pro 已开通
            </div>

            <h1 style="margin: 18px 0 8px; font-size: 28px; line-height: 1.25;">
              AI Bot Pro 会员已开通
            </h1>

            <p style="margin: 0; color: #cbd5e1;">
              ${safeName}，你好，你的 Pro 权限已经开通成功。
            </p>
          </div>

          <div style="padding: 22px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 18px; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>开通套餐：</strong>${safePlan}</p>
            <p style="margin: 0 0 10px;"><strong>每日额度：</strong>${safeDailyLimit} 次</p>
            <p style="margin: 0;"><strong>到期时间：</strong>${safeExpiredAt}</p>
          </div>

          <p>
            你现在可以登录 AI Bot Pro 使用 Pro 权限，并在会员中心查看套餐状态、今日剩余次数和开通记录。
          </p>

          <div style="margin: 24px 0;">
            <a href="${SITE_URL}/dashboard" style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #111827; color: #fff; text-decoration: none; font-weight: 700;">
              查看会员中心
            </a>

            <a href="${SITE_URL}/chat" style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #ecfdf5; color: #047857; text-decoration: none; font-weight: 700; margin-left: 8px;">
              使用 AI 工具
            </a>
          </div>

          <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
            这封邮件由 AI Bot Pro 系统自动发送。
          </p>
        </div>
      `,
      text: `AI Bot Pro 会员已开通

${params.name || "用户"}，你好：

你的 AI Bot Pro Pro 权限已经开通成功。

开通套餐：${params.plan}
每日额度：${params.dailyLimit} 次
到期时间：${formatExpiredAt(params.expiredAt)}

会员中心：
${SITE_URL}/dashboard

AI 工具：
${SITE_URL}/chat
`,
    });

    if (error) {
      console.error("Pro 开通通知邮件发送失败：", error);

      return {
        sent: false,
        reason: "Resend 发送失败",
      };
    }

    return {
      sent: true,
    };
  } catch (error) {
    console.error("Pro 开通通知邮件异常：", error);

    return {
      sent: false,
      reason: "邮件发送异常",
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const applicationId = String(body.applicationId || "").trim();

    if (!applicationId) {
      return Response.json({ error: "缺少申请 ID。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: application, error: applicationError } = await supabase
      .from("pro_applications")
      .select(
        "id, user_id, name, email, company, plan, use_case, message, status, created_at, updated_at"
      )
      .eq("id", applicationId)
      .single();

    if (applicationError || !application) {
      console.error("读取 Pro 申请失败：", applicationError);

      return Response.json(
        { error: "读取 Pro 申请失败，申请可能不存在。" },
        { status: 404 }
      );
    }

    const typedApplication = application as ProApplication;

    let targetUserId = typedApplication.user_id;
    let matchedByEmail = false;

    if (!targetUserId) {
      const normalizedEmail = typedApplication.email.trim().toLowerCase();

      const { data: usersData, error: usersError } =
        await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (usersError) {
        console.error("按邮箱查找用户失败：", usersError);

        return Response.json(
          {
            error:
              "这条申请没有用户 ID，系统按邮箱查找用户失败，请检查 Supabase 服务端配置。",
          },
          { status: 500 }
        );
      }

      const matchedUser = usersData.users.find(
        (user) => user.email?.trim().toLowerCase() === normalizedEmail
      );

      targetUserId = matchedUser?.id || null;
      matchedByEmail = Boolean(targetUserId);
    }

    if (!targetUserId) {
      return Response.json(
        {
          error:
            "这条申请没有用户 ID，并且申请邮箱没有匹配到已注册账号。请让用户先注册/登录一次，再重新提交申请。",
        },
        { status: 400 }
      );
    }

    const expiredAt = getExpiredAt(typedApplication.plan);
    const amountCents = getAmountCents(typedApplication.plan);
    const dailyLimit = 100;
    const now = new Date().toISOString();

    const { error: planError } = await supabase.from("user_plans").upsert(
      {
        user_id: targetUserId,
        plan: "pro",
        daily_limit: dailyLimit,
        expired_at: expiredAt,
        updated_at: now,
      },
      {
        onConflict: "user_id",
      }
    );

    if (planError) {
      console.error("一键开通 Pro 失败：", planError);

      return Response.json(
        { error: "一键开通 Pro 失败，请稍后再试。" },
        { status: 500 }
      );
    }

    const { data: updatedApplication, error: updateError } = await supabase
      .from("pro_applications")
      .update({
        status: "approved",
        user_id: targetUserId,
        updated_at: now,
      })
      .eq("id", applicationId)
      .select(
        "id, user_id, name, email, company, plan, use_case, message, status, created_at, updated_at"
      )
      .single();

    if (updateError || !updatedApplication) {
      console.error("更新申请状态失败：", updateError);

      return Response.json(
        {
          error:
            "Pro 已开通，但申请状态更新失败。你可以刷新页面后手动标记已开通。",
        },
        { status: 500 }
      );
    }

    const emailResult = await sendProApprovedEmail({
      email: typedApplication.email,
      name: typedApplication.name,
      plan: typedApplication.plan,
      dailyLimit,
      expiredAt,
    });

    const { data: existingOrders } = await supabase
      .from("pro_orders")
      .select("id")
      .eq("application_id", typedApplication.id)
      .limit(1);

    const existingOrderId = existingOrders?.[0]?.id;

    const orderPayload = {
      application_id: typedApplication.id,
      user_id: targetUserId,
      email: typedApplication.email,
      name: typedApplication.name || null,
      plan_name: typedApplication.plan,
      amount_cents: amountCents,
      currency: "CNY",
      daily_limit: dailyLimit,
      expired_at: expiredAt,
      status: "active",
      source: matchedByEmail ? "manual_admin_email_match" : "manual_admin",
      email_sent: emailResult.sent,
      updated_at: now,
    };

    const { data: savedOrder, error: orderError } = existingOrderId
      ? await supabase
          .from("pro_orders")
          .update(orderPayload)
          .eq("id", existingOrderId)
          .select("id")
          .single()
      : await supabase.from("pro_orders").insert(orderPayload).select("id").single();

    if (orderError) {
      console.error("写入 Pro 开通记录失败：", orderError);

      await writeAdminAuditLog({
        req,
        action: "approve_pro",
        targetType: "pro_application",
        targetId: typedApplication.id,
        description: "管理员已开通 Pro，但写入开通记录失败。",
        metadata: {
          result: "partial_success_order_failed",
          userId: targetUserId,
          email: typedApplication.email,
          plan: typedApplication.plan,
          dailyLimit,
          expiredAt,
          amountCents,
          emailSent: emailResult.sent,
          matchedByEmail,
        },
      });

      return Response.json({
        success: true,
        message: emailResult.sent
          ? "Pro 已开通，邮件已发送，但开通记录写入失败，请检查 pro_orders 表。"
          : "Pro 已开通，但邮件未发送，开通记录写入失败，请检查 Resend 和 pro_orders 表。",
        application: updatedApplication,
        emailSent: emailResult.sent,
        orderSaved: false,
        matchedByEmail,
        plan: {
          userId: targetUserId,
          plan: "pro",
          dailyLimit,
          expiredAt,
          amountCents,
        },
      });
    }

    await writeAdminAuditLog({
      req,
      action: "approve_pro",
      targetType: "pro_application",
      targetId: typedApplication.id,
      description: "管理员一键审核并开通 Pro。",
      metadata: {
        result: "success",
        orderId: savedOrder?.id || existingOrderId || null,
        userId: targetUserId,
        email: typedApplication.email,
        name: typedApplication.name,
        plan: typedApplication.plan,
        dailyLimit,
        expiredAt,
        amountCents,
        emailSent: emailResult.sent,
        orderSaved: true,
        matchedByEmail,
      },
    });

    return Response.json({
      success: true,
      message: matchedByEmail
        ? emailResult.sent
          ? "已按邮箱匹配到注册账号，并成功开通 Pro，已写入开通记录和发送邮件。"
          : "已按邮箱匹配到注册账号，并成功开通 Pro，已写入开通记录，但邮件通知未发送，请检查 Resend 配置。"
        : emailResult.sent
        ? "已成功一键开通 Pro，已写入开通记录，并已发送邮件通知用户。"
        : "已成功一键开通 Pro，已写入开通记录，但邮件通知未发送，请检查 Resend 配置。",
      application: updatedApplication,
      emailSent: emailResult.sent,
      orderSaved: true,
      matchedByEmail,
      plan: {
        userId: targetUserId,
        plan: "pro",
        dailyLimit,
        expiredAt,
        amountCents,
      },
    });
  } catch (error) {
    console.error("一键开通 Pro 接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}
