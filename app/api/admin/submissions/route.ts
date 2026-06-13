import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: applications, error: applicationsError } = await supabase
      .from("pro_applications")
      .select(
        "id, user_id, name, email, company, plan, use_case, message, status, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (applicationsError) {
      console.error("读取 Pro 申请失败：", applicationsError);

      return Response.json(
        { error: "读取 Pro 申请失败。" },
        { status: 500 }
      );
    }

    const { data: messages, error: messagesError } = await supabase
      .from("contact_messages")
      .select("id, email, type, message, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (messagesError) {
      console.error("读取联系反馈失败：", messagesError);

      return Response.json(
        { error: "读取联系反馈失败。" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      applications: applications || [],
      messages: messages || [],
    });
  } catch (error) {
    console.error("后台提交记录接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}