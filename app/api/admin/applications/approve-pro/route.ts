import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const resend = new Resend(resendApiKey);

  const safeName = escapeHtml(params.name || "用户");
  const safePlan = escapeHtml(params.plan);
  const safeDailyLimit = escapeHtml(String(params.dailyLimit));
  const safeExpiredAt = escapeHtml(formatExpiredAt(params.expiredAt));

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [params.email],
    subject: "你的 AI Bot Pro Pro 会员已开通",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #111; max-width: 680px;">
        <h2 style="margin-bottom: 16px;">AI Bot Pro Pro 会员已开通</h2>

        <p>${safeName}，你好：</p>

        <p>
          你的 AI Bot Pro Pro 会员已经开通成功，现在可以登录账号使用 Pro 权限。
        </p>

        <div style="padding: 16px; background: #f7f7f7; border-radius: 12px; margin: 20px 0;">
          <p><strong>开通套餐：</strong>${safePlan}</p>
          <p><strong>每日额度：</strong>${safeDailyLimit} 次</p>
          <p><strong>到期时间：</strong>${safeExpiredAt}</p>
        </div>

        <p>
          你可以登录会员中心查看当前套餐状态和每日剩余次数。
        </p>

        <p>
          会员中心：<a href="https://aibotpro.top/dashboard">https://aibotpro.top/dashboard</a>
        </p>

        <p style="margin-top: 24px; color: #666; font-size: 13px;">
          这封邮件由 AI Bot Pro 系统自动发送。
        </p>
      </div>
    `,
    text: `
AI Bot Pro Pro 会员已开通

${params.name || "用户"}，你好：

你的 AI Bot Pro Pro 会员已经开通成功。

开通套餐：${params.plan}
每日额度：${params.dailyLimit} 次
到期时间：${formatExpiredAt(params.expiredAt)}

你可以登录会员中心查看当前套餐状态和每日剩余次数：
https://aibotpro.top/dashboard
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
      .single<ProApplication>();

    if (applicationError || !application) {
      console.error("读取 Pro 申请失败：", applicationError);

      return Response.json(
        { error: "读取 Pro 申请失败，申请可能不存在。" },
        { status: 404 }
      );
    }

    let targetUserId = application.user_id;
    let matchedByEmail = false;

    if (!targetUserId) {
      const normalizedEmail = application.email.trim().toLowerCase();

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

    const expiredAt = getExpiredAt(application.plan);
    const amountCents = getAmountCents(application.plan);
    const dailyLimit = 100;

    const { error: planError } = await supabase.from("user_plans").upsert(
      {
        user_id: targetUserId,
        plan: "pro",
        daily_limit: dailyLimit,
        expired_at: expiredAt,
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select(
        "id, user_id, name, email, company, plan, use_case, message, status, created_at, updated_at"
      )
      .single<ProApplication>();

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
      email: application.email,
      name: application.name,
      plan: application.plan,
      dailyLimit,
      expiredAt,
    });

    const { data: existingOrders } = await supabase
      .from("pro_orders")
      .select("id")
      .eq("application_id", application.id)
      .limit(1);

    const existingOrderId = existingOrders?.[0]?.id;

    const orderPayload = {
      application_id: application.id,
      user_id: targetUserId,
      email: application.email,
      name: application.name || null,
      plan_name: application.plan,
      amount_cents: amountCents,
      currency: "CNY",
      daily_limit: dailyLimit,
      expired_at: expiredAt,
      status: "active",
      source: matchedByEmail ? "manual_admin_email_match" : "manual_admin",
      email_sent: emailResult.sent,
      updated_at: new Date().toISOString(),
    };

    const { error: orderError } = existingOrderId
      ? await supabase
          .from("pro_orders")
          .update(orderPayload)
          .eq("id", existingOrderId)
      : await supabase.from("pro_orders").insert(orderPayload);

    if (orderError) {
      console.error("写入 Pro 开通记录失败：", orderError);

      return Response.json({
        success: true,
        message: emailResult.sent
          ? "Pro 已开通，邮件已发送，但开通记录写入失败，请检查 pro_orders 表。"
          : "Pro 已开通，但邮件未发送，开通记录也写入失败，请检查 Resend 和 pro_orders 表。",
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