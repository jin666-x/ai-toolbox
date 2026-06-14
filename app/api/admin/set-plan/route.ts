import { writeAdminAuditLog } from "@/lib/admin-audit-log";
import { createAdminClient } from "@/lib/supabase/admin";

type PlanType = "free" | "pro";

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeExpiredAt(value: unknown) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return "invalid";
  }

  return date.toISOString();
}

export async function POST(req: Request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      return Response.json(
        { error: "服务器未配置后台访问密钥。" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const password = String(body.password || "").trim();
    const userId = String(body.userId || "").trim();
    const plan = String(body.plan || "free").trim().toLowerCase() as PlanType;
    const dailyLimit = Number(body.dailyLimit || 10);
    const expiredAt = normalizeExpiredAt(body.expiredAt);

    if (password !== adminSecret) {
      return Response.json({ error: "管理员密码错误。" }, { status: 401 });
    }

    if (!userId) {
      return Response.json({ error: "请输入用户 ID。" }, { status: 400 });
    }

    if (!isUuidLike(userId)) {
      return Response.json(
        { error: "用户 ID 格式不正确，请确认是否为 Supabase 用户 UUID。" },
        { status: 400 }
      );
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

    if (dailyLimit > 10000) {
      return Response.json(
        { error: "每日次数不能超过 10000，避免误操作。" },
        { status: 400 }
      );
    }

    if (expiredAt === "invalid") {
      return Response.json(
        { error: "到期时间格式不正确，请重新填写。" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: beforePlan } = await supabase
      .from("user_plans")
      .select("plan, daily_limit, expired_at")
      .eq("user_id", userId)
      .maybeSingle();

    const now = new Date().toISOString();

    const { error } = await supabase.from("user_plans").upsert(
      {
        user_id: userId,
        plan,
        daily_limit: dailyLimit,
        expired_at: expiredAt || null,
        updated_at: now,
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

    await writeAdminAuditLog({
      req,
      action: "update_plan",
      targetType: "user_plan",
      targetId: userId,
      description: "管理员手动修改用户套餐。",
      metadata: {
        before: beforePlan || null,
        after: {
          plan,
          dailyLimit,
          expiredAt: expiredAt || null,
        },
      },
    });

    return Response.json({
      success: true,
      message: "套餐保存成功。",
      data: {
        userId,
        plan,
        dailyLimit,
        expiredAt: expiredAt || null,
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
