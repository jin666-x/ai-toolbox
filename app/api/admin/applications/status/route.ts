import { createAdminClient } from "@/lib/supabase/admin";

type ApplicationStatus = "pending" | "contacted" | "approved" | "rejected";

const allowedStatuses: ApplicationStatus[] = [
  "pending",
  "contacted",
  "approved",
  "rejected",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const applicationId = String(body.applicationId || "").trim();
    const status = String(body.status || "").trim() as ApplicationStatus;

    if (!applicationId) {
      return Response.json({ error: "缺少申请 ID。" }, { status: 400 });
    }

    if (!allowedStatuses.includes(status)) {
      return Response.json({ error: "状态不合法。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("pro_applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select(
        "id, user_id, name, email, company, plan, use_case, message, status, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("更新 Pro 申请状态失败：", error);

      return Response.json(
        { error: "更新状态失败，请稍后再试。" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      application: data,
    });
  } catch (error) {
    console.error("后台更新申请状态接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}