import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const pageSize = Math.min(
      Math.max(Number(url.searchParams.get("pageSize") || 30), 1),
      100
    );

    const action = String(url.searchParams.get("action") || "").trim();
    const targetId = String(url.searchParams.get("targetId") || "").trim();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createAdminClient();

    let query = supabase
      .from("admin_audit_logs")
      .select(
        "id, admin_email, action, target_type, target_id, description, metadata, ip, user_agent, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (action) {
      query = query.eq("action", action);
    }

    if (targetId) {
      query = query.eq("target_id", targetId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("读取后台操作日志失败：", error);

      return Response.json(
        { error: "读取后台操作日志失败。" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      logs: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("后台操作日志接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}
