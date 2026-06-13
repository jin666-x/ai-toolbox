import { createAdminClient } from "@/lib/supabase/admin";

type ProApplication = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  plan: string;
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

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [
      applicationsResult,
      ordersResult,
      messagesResult,
    ] = await Promise.all([
      supabase
        .from("pro_applications")
        .select("id, user_id, name, email, plan, status, created_at")
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

    const applications =
      ((applicationsResult.data || []) as ProApplication[]) || [];
    const orders = ((ordersResult.data || []) as ProOrder[]) || [];
    const messages = ((messagesResult.data || []) as ContactMessage[]) || [];

    const validRevenueOrders = orders.filter(
      (item) => item.status !== "refunded" && item.status !== "cancelled"
    );

    const revenueCents = validRevenueOrders.reduce(
      (sum, item) => sum + (Number(item.amount_cents) || 0),
      0
    );

    return Response.json({
      success: true,
      stats: {
        totalApplications: applications.length,
        pendingApplications: applications.filter(
          (item) => item.status === "pending"
        ).length,
        approvedApplications: applications.filter(
          (item) => item.status === "approved"
        ).length,
        contactedApplications: applications.filter(
          (item) => item.status === "contacted"
        ).length,
        rejectedApplications: applications.filter(
          (item) => item.status === "rejected"
        ).length,
        totalOrders: orders.length,
        activeOrders: orders.filter((item) => item.status === "active").length,
        expiredOrders: orders.filter((item) => item.status === "expired")
          .length,
        refundedOrders: orders.filter((item) => item.status === "refunded")
          .length,
        cancelledOrders: orders.filter((item) => item.status === "cancelled")
          .length,
        totalMessages: messages.length,
        revenueCents,
      },
      recentApplications: applications.slice(0, 5),
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