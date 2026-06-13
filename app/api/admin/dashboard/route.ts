import { createAdminClient } from "@/lib/supabase/admin";

type ProApplication = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  plan: string;
  use_case: string;
  message: string | null;
  status: string;
  created_at: string;
};

type ProOrder = {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  plan_name: string;
  amount_cents: number;
  currency: string;
  status: string;
  expired_at: string | null;
  created_at: string;
};

type ContactMessage = {
  id: string;
  created_at: string;
};

function isPaymentApplication(item: ProApplication) {
  const raw = item.message || "";

  return raw.includes("【付款确认】") || item.use_case.includes("付款确认");
}

function getChinaTodayRange() {
  const chinaNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const chinaDate = chinaNow.toISOString().slice(0, 10);

  return {
    start: new Date(`${chinaDate}T00:00:00+08:00`).toISOString(),
    end: new Date(`${chinaDate}T23:59:59.999+08:00`).toISOString(),
  };
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [applicationsResult, ordersResult, messagesResult] = await Promise.all([
      supabase
        .from("pro_applications")
        .select(
          "id, user_id, name, email, plan, use_case, message, status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(1000),

      supabase
        .from("pro_orders")
        .select(
          "id, user_id, email, name, plan_name, amount_cents, currency, status, expired_at, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(1000),

      supabase
        .from("contact_messages")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    if (applicationsResult.error) {
      console.error("读取 Pro 申请统计失败：", applicationsResult.error);

      return Response.json(
        { error: "读取 Pro 申请统计失败。" },
        { status: 500 }
      );
    }

    if (ordersResult.error) {
      console.error("读取 Pro 开通记录统计失败：", ordersResult.error);

      return Response.json(
        { error: "读取 Pro 开通记录统计失败。" },
        { status: 500 }
      );
    }

    if (messagesResult.error) {
      console.error("读取联系反馈统计失败：", messagesResult.error);

      return Response.json(
        { error: "读取联系反馈统计失败。" },
        { status: 500 }
      );
    }

    const applications = ((applicationsResult.data || []) as ProApplication[]) || [];
    const orders = ((ordersResult.data || []) as ProOrder[]) || [];
    const messages = ((messagesResult.data || []) as ContactMessage[]) || [];

    const todayRange = getChinaTodayRange();

    const paymentApplications = applications.filter((item) =>
      isPaymentApplication(item)
    );

    const pendingPaymentApplications = paymentApplications.filter(
      (item) => item.status === "pending"
    );

    const pendingNormalApplications = applications.filter(
      (item) => item.status === "pending" && !isPaymentApplication(item)
    );

    const todayApplications = applications.filter(
      (item) => item.created_at >= todayRange.start && item.created_at <= todayRange.end
    );

    const todayOrders = orders.filter(
      (item) => item.created_at >= todayRange.start && item.created_at <= todayRange.end
    );

    const validRevenueOrders = orders.filter(
      (item) => item.status !== "refunded" && item.status !== "cancelled"
    );

    const revenueCents = validRevenueOrders.reduce(
      (sum, item) => sum + (Number(item.amount_cents) || 0),
      0
    );

    const todayRevenueCents = todayOrders
      .filter((item) => item.status !== "refunded" && item.status !== "cancelled")
      .reduce((sum, item) => sum + (Number(item.amount_cents) || 0), 0);

    const activeProUserKeys = new Set(
      orders
        .filter((item) => item.status === "active")
        .map((item) => item.user_id || item.email)
        .filter(Boolean)
    );

    return Response.json({
      success: true,
      stats: {
        totalApplications: applications.length,
        pendingApplications: applications.filter((item) => item.status === "pending").length,
        pendingPaymentApplications: pendingPaymentApplications.length,
        pendingNormalApplications: pendingNormalApplications.length,
        todayApplications: todayApplications.length,
        paymentApplications: paymentApplications.length,
        approvedApplications: applications.filter((item) => item.status === "approved").length,
        contactedApplications: applications.filter((item) => item.status === "contacted").length,
        rejectedApplications: applications.filter((item) => item.status === "rejected").length,
        totalOrders: orders.length,
        activeOrders: orders.filter((item) => item.status === "active").length,
        activeProUsers: activeProUserKeys.size,
        expiredOrders: orders.filter((item) => item.status === "expired").length,
        refundedOrders: orders.filter((item) => item.status === "refunded").length,
        cancelledOrders: orders.filter((item) => item.status === "cancelled").length,
        todayOrders: todayOrders.length,
        totalMessages: messages.length,
        revenueCents,
        todayRevenueCents,
      },
      recentApplications: applications.slice(0, 5),
      recentPaymentApplications: paymentApplications.slice(0, 5),
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    console.error("后台首页统计接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}
