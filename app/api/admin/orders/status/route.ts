import { createAdminClient } from "@/lib/supabase/admin";

type OrderStatus = "active" | "expired" | "refunded" | "cancelled";

const allowedStatuses: OrderStatus[] = [
  "active",
  "expired",
  "refunded",
  "cancelled",
];

const FREE_DAILY_LIMIT = 10;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = String(body.orderId || "").trim();
    const status = String(body.status || "").trim() as OrderStatus;

    if (!orderId) {
      return Response.json({ error: "缺少订单 ID。" }, { status: 400 });
    }

    if (!allowedStatuses.includes(status)) {
      return Response.json({ error: "订单状态不合法。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("pro_orders")
      .select(
        "id, user_id, email, plan_name, daily_limit, expired_at, status"
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

    const { data: updatedOrder, error: updateOrderError } = await supabase
      .from("pro_orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(
        "id, application_id, user_id, email, name, plan_name, amount_cents, currency, daily_limit, expired_at, status, source, email_sent, created_at, updated_at"
      )
      .single();

    if (updateOrderError || !updatedOrder) {
      console.error("更新订单状态失败：", updateOrderError);

      return Response.json(
        { error: "更新订单状态失败。" },
        { status: 500 }
      );
    }

    if (order.user_id) {
      if (status === "active") {
        const { error: planError } = await supabase.from("user_plans").upsert(
          {
            user_id: order.user_id,
            plan: "pro",
            daily_limit: order.daily_limit || 100,
            expired_at: order.expired_at,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

        if (planError) {
          console.error("恢复 Pro 失败：", planError);

          return Response.json(
            {
              error:
                "订单状态已更新，但恢复 Pro 失败，请到套餐管理里手动修改。",
            },
            { status: 500 }
          );
        }
      }

      if (status === "cancelled" || status === "refunded" || status === "expired") {
        const { error: planError } = await supabase.from("user_plans").upsert(
          {
            user_id: order.user_id,
            plan: "free",
            daily_limit: FREE_DAILY_LIMIT,
            expired_at: null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

        if (planError) {
          console.error("降级 Free 失败：", planError);

          return Response.json(
            {
              error:
                "订单状态已更新，但降级 Free 失败，请到套餐管理里手动修改。",
            },
            { status: 500 }
          );
        }
      }
    }

    return Response.json({
      success: true,
      message:
        status === "active"
          ? "已恢复 Pro，并同步更新用户套餐。"
          : "已更新订单状态，并同步降级为 Free。",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("更新订单状态接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}