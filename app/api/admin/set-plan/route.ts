import { createAdminClient } from "@/lib/supabase/admin";

type PlanType = "free" | "pro";

export async function POST(req: Request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      return Response.json(
        { error: "服务器未配置 ADMIN_SECRET。" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const password = String(body.password || "").trim();
    const userId = String(body.userId || "").trim();
    const plan = String(body.plan || "free").trim().toLowerCase() as PlanType;
    const dailyLimit = Number(body.dailyLimit || 10);
    const expiredAt = body.expiredAt ? String(body.expiredAt).trim() : null;

    if (password !== adminSecret) {
      return Response.json({ error: "管理员密码错误。" }, { status: 401 });
    }

    if (!userId) {
      return Response.json({ error: "请输入用户 ID。" }, { status: 400 });
    }

    if (plan !== "free" && plan !== "pro") {
      return Response.json(
        { error: "套餐只能是 free 或 pro。" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(dailyLimit) || dailyLimit <= 0) {
      return Response.json(
        { error: "每日次数必须大于 0。" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("user_plans").upsert(
      {
        user_id: userId,
        plan,
        daily_limit: dailyLimit,
        expired_at: expiredAt || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("保存用户套餐失败：", error);

      return Response.json(
        { error: "保存用户套餐失败，请检查用户 ID 是否正确。" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "套餐保存成功。",
      data: {
        userId,
        plan,
        dailyLimit,
        expiredAt,
      },
    });
  } catch (error) {
    console.error("后台设置套餐接口错误：", error);

    return Response.json(
      { error: "服务器异常，请稍后再试。" },
      { status: 500 }
    );
  }
}