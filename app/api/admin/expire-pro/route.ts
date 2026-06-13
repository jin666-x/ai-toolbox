import { createAdminClient } from "@/lib/supabase/admin";

const FREE_DAILY_LIMIT = 10;

export async function POST() {
  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: expiredPlans, error: findPlansError } = await supabase
      .from("user_plans")
      .select("user_id, expired_at")
      .eq("plan", "pro")
      .not("expired_at", "is", null)
      .lte("expired_at", now);

    if (findPlansError) {
      console.error("查询过期 Pro 失败：", findPlansError);

      return Response.json(
        { error: "查询过期 Pro 失败。" },
        { status: 500 }
      );
    }

    const expiredUserIds =
      expiredPlans?.map((item) => item.user_id).filter(Boolean) || [];

    if (expiredUserIds.length === 0) {
      return Response.json({
        success: true,
        message: "没有需要降级的 Pro 用户。",
        expiredCount: 0,
        orderStatusUpdated: true,
      });
    }

    const { error: updatePlansError } = await supabase
      .from("user_plans")
      .update({
        plan: "free",
        daily_limit: FREE_DAILY_LIMIT,
        expired_at: null,
        updated_at: new Date().toISOString(),
      })
      .in("user_id", expiredUserIds);

    if (updatePlansError) {
      console.error("降级过期 Pro 失败：", updatePlansError);

      return Response.json(
        { error: "降级过期 Pro 失败。" },
        { status: 500 }
      );
    }

    const { error: updateOrdersError } = await supabase
      .from("pro_orders")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .in("user_id", expiredUserIds)
      .eq("status", "active")
      .not("expired_at", "is", null)
      .lte("expired_at", now);

    if (updateOrdersError) {
      console.error("更新订单过期状态失败：", updateOrdersError);

      return Response.json({
        success: true,
        message: "Pro 用户已降级，但订单状态更新失败，请检查 pro_orders 表。",
        expiredCount: expiredUserIds.length,
        orderStatusUpdated: false,
      });
    }

    return Response.json({
      success: true,
      message: "过期 Pro 已自动降级为 Free，并已更新订单状态。",
      expiredCount: expiredUserIds.length,
      orderStatusUpdated: true,
    });
  } catch (error) {
    console.error("后台手动降级 Pro 接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}