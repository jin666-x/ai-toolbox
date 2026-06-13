import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

type ProOrder = {
  id: string;
  application_id: string | null;
  user_id: string | null;
  email: string;
  name: string | null;
  plan_name: string;
  amount_cents: number;
  currency: string;
  daily_limit: number;
  expired_at: string | null;
  status: string;
  source: string;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
};

const SITE_URL = "https://aibotpro.top";

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

async function sendProApprovedEmail(order: ProOrder) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "AI Bot Pro <noreply@aibotpro.top>";

  if (!resendApiKey) {
    return {
      sent: false,
      reason: "缺少 RESEND_API_KEY",
    };
  }

  try {
    const resend = new Resend(resendApiKey);

    const safeName = escapeHtml(order.name || "用户");
    const safePlan = escapeHtml(order.plan_name);
    const safeDailyLimit = escapeHtml(String(order.daily_limit || 100));
    const safeExpiredAt = escapeHtml(formatExpiredAt(order.expired_at));

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [order.email],
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

${order.name || "用户"}，你好：

你的 AI Bot Pro Pro 权限已经开通成功。

开通套餐：${order.plan_name}
每日额度：${order.daily_limit || 100} 次
到期时间：${formatExpiredAt(order.expired_at)}

会员中心：
${SITE_URL}/dashboard

AI 工具：
${SITE_URL}/chat
`,
    });

    if (error) {
      console.error("重发 Pro 开通邮件失败：", error);

      return {
        sent: false,
        reason: "Resend 发送失败",
      };
    }

    return {
      sent: true,
    };
  } catch (error) {
    console.error("重发 Pro 开通邮件异常：", error);

    return {
      sent: false,
      reason: "邮件发送异常",
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId || "").trim();

    if (!orderId) {
      return Response.json({ error: "缺少订单 ID。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("pro_orders")
      .select(
        "id, application_id, user_id, email, name, plan_name, amount_cents, currency, daily_limit, expired_at, status, source, email_sent, created_at, updated_at"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("读取订单失败：", orderError);

      return Response.json(
        { error: "读取订单失败，订单可能不存在。" },
        { status: 404 }
      );
    }

    const typedOrder = order as ProOrder;

    if (!typedOrder.email) {
      return Response.json(
        { error: "这条订单没有邮箱，无法发送邮件。" },
        { status: 400 }
      );
    }

    const emailResult = await sendProApprovedEmail(typedOrder);

    if (!emailResult.sent) {
      return Response.json(
        {
          error:
            emailResult.reason ||
            "邮件发送失败，请检查 RESEND_API_KEY 和 CONTACT_FROM_EMAIL。",
        },
        { status: 500 }
      );
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("pro_orders")
      .update({
        email_sent: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(
        "id, application_id, user_id, email, name, plan_name, amount_cents, currency, daily_limit, expired_at, status, source, email_sent, created_at, updated_at"
      )
      .single();

    if (updateError || !updatedOrder) {
      console.error("邮件已发送，但更新订单 email_sent 失败：", updateError);

      return Response.json({
        success: true,
        message: "Pro 开通邮件已发送，但订单邮件状态更新失败。",
        order: typedOrder,
      });
    }

    return Response.json({
      success: true,
      message: "Pro 开通邮件已重新发送。",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("重发 Pro 开通邮件接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}
