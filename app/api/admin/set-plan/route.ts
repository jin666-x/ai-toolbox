import { writeAdminAuditLog } from "@/lib/admin-audit-log";
import { createAdminClient } from "@/lib/supabase/admin";

type PlanType = "free" | "pro";

type ResolveUserResult =
  | {
      ok: true;
      userId: string;
      matchedBy: "uuid" | "email" | "short_id";
      input: string;
      email?: string | null;
    }
  | {
      ok: false;
      error: string;
      input: string;
    };

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isEmailLike(value: string) {
  return (
    value.length <= 254 &&
    !/[\r\n]/.test(value) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function isShortIdLike(value: string) {
  // 支持 UUID 前 6 - 12 位，越长越不容易重复。
  return /^[0-9a-f]{6,12}$/i.test(value);
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

async function listAuthUsersForMatch() {
  const supabase = createAdminClient();
  const perPage = 1000;
  const maxPages = 20;
  const allUsers: Array<{
    id: string;
    email?: string;
  }> = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const users = data.users.map((user) => ({
      id: user.id,
      email: user.email || undefined,
    }));

    allUsers.push(...users);

    if (users.length < perPage) {
      break;
    }
  }

  return allUsers;
}

async function resolveUserIdentifier(inputValue: string): Promise<ResolveUserResult> {
  const input = inputValue.trim();

  if (!input) {
    return {
      ok: false,
      error: "请输入用户 ID、邮箱或短 ID。",
      input,
    };
  }

  if (isUuidLike(input)) {
    return {
      ok: true,
      userId: input,
      matchedBy: "uuid",
      input,
    };
  }

  const users = await listAuthUsersForMatch();

  if (isEmailLike(input)) {
    const normalizedEmail = input.toLowerCase();

    const matchedUser = users.find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail
    );

    if (!matchedUser) {
      return {
        ok: false,
        error: "没有找到这个邮箱对应的注册用户，请确认用户已经注册/登录过。",
        input,
      };
    }

    return {
      ok: true,
      userId: matchedUser.id,
      matchedBy: "email",
      input,
      email: matchedUser.email || null,
    };
  }

  if (isShortIdLike(input)) {
    const normalizedShortId = input.toLowerCase();

    const matchedUsers = users.filter((user) =>
      user.id.toLowerCase().startsWith(normalizedShortId)
    );

    if (matchedUsers.length === 0) {
      return {
        ok: false,
        error: "没有找到这个短 ID 对应的用户，请多复制几位用户 ID 或改用邮箱。",
        input,
      };
    }

    if (matchedUsers.length > 1) {
      return {
        ok: false,
        error:
          "这个短 ID 匹配到多个用户，不够唯一。请多复制几位用户 ID，或直接填写邮箱。",
        input,
      };
    }

    return {
      ok: true,
      userId: matchedUsers[0].id,
      matchedBy: "short_id",
      input,
      email: matchedUsers[0].email || null,
    };
  }

  return {
    ok: false,
    error: "请输入完整用户 ID、用户邮箱，或 UUID 前 6-12 位短 ID。",
    input,
  };
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

    // 为了兼容旧前端，这里仍然读取 userId 字段。
    // 但现在 userId 可以填：完整 UUID / 用户邮箱 / UUID 前 6-12 位短 ID。
    const userIdentifier = String(body.userId || body.userIdentifier || "")
      .trim();

    const plan = String(body.plan || "free").trim().toLowerCase() as PlanType;
    const dailyLimit = Number(body.dailyLimit || 10);
    const expiredAt = normalizeExpiredAt(body.expiredAt);

    if (password !== adminSecret) {
      return Response.json({ error: "管理员密码错误。" }, { status: 401 });
    }

    const resolvedUser = await resolveUserIdentifier(userIdentifier);

    if (!resolvedUser.ok) {
      return Response.json({ error: resolvedUser.error }, { status: 400 });
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
      .eq("user_id", resolvedUser.userId)
      .maybeSingle();

    const now = new Date().toISOString();

    const { error } = await supabase.from("user_plans").upsert(
      {
        user_id: resolvedUser.userId,
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
        { error: "保存用户套餐失败，请检查用户信息是否正确。" },
        { status: 500 }
      );
    }

    await writeAdminAuditLog({
      req,
      action: "update_plan",
      targetType: "user_plan",
      targetId: resolvedUser.userId,
      description: "管理员手动修改用户套餐。",
      metadata: {
        input: resolvedUser.input,
        matchedBy: resolvedUser.matchedBy,
        matchedEmail: resolvedUser.email || null,
        before: beforePlan || null,
        after: {
          userId: resolvedUser.userId,
          plan,
          dailyLimit,
          expiredAt: expiredAt || null,
        },
      },
    });

    return Response.json({
      success: true,
      message:
        resolvedUser.matchedBy === "uuid"
          ? "套餐保存成功。"
          : `套餐保存成功，已通过${
              resolvedUser.matchedBy === "email" ? "邮箱" : "短 ID"
            }匹配到用户。`,
      data: {
        input: resolvedUser.input,
        matchedBy: resolvedUser.matchedBy,
        matchedEmail: resolvedUser.email || null,
        userId: resolvedUser.userId,
        shortId: resolvedUser.userId.slice(0, 8),
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
