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

    if (!application.user_id) {
      return Response.json(
        {
          error:
            "这条申请没有用户 ID，可能是旧申请或用户未登录提交，无法一键开通。",
        },
        { status: 400 }
      );
    }

    const expiredAt = getExpiredAt(application.plan);

    const { error: planError } = await supabase.from("user_plans").upsert(
      {
        user_id: application.user_id,
        plan: "pro",
        daily_limit: 100,
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

    return Response.json({
      success: true,
      message: "已成功一键开通 Pro。",
      application: updatedApplication,
      plan: {
        userId: application.user_id,
        plan: "pro",
        dailyLimit: 100,
        expiredAt,
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