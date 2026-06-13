import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
      .from("pro_orders")
      .select(
        "id, application_id, user_id, email, name, plan_name, amount_cents, currency, daily_limit, expired_at, status, source, email_sent, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      console.error("读取 Pro 开通记录失败：", error);

      return Response.json(
        { error: "读取 Pro 开通记录失败。" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error("后台开通记录接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}
