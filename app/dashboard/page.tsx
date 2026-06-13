"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const FREE_DAILY_LIMIT = 10;

type PlanType = "free" | "pro";

type UserPlanState = {
  plan: PlanType;
  dailyLimit: number;
  expiredAt: string | null;
};

type ProOrder = {
  id: string;
  plan_name: string;
  amount_cents: number;
  currency: string;
  daily_limit: number;
  expired_at: string | null;
  status: string;
  email_sent: boolean;
  created_at: string;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getPlanName(plan: PlanType) {
  if (plan === "pro") {
    return "Pro 会员版";
  }

  return "Free 免费版";
}

function getPlanDesc(plan: PlanType, dailyLimit: number) {
  if (plan === "pro") {
    return `当前账号已开通 Pro 会员，每日可使用 ${dailyLimit} 次 AI 工具。`;
  }

  return `当前账号为 Free 免费版，每日可使用 ${dailyLimit} 次 AI 工具。`;
}

function formatTime(value: string | null) {
  if (!value) return "未设置";

  try {
    return new Date(value).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour12: false,
    });
  } catch {
    return value;
  }
}

function formatAmount(amountCents: number, currency: string) {
  const amount = amountCents / 100;

  if (amountCents <= 0) {
    return "￥0 / 试用或手动开通";
  }

  if (currency === "CNY") {
    return `￥${amount.toFixed(2)}`;
  }

  return `${amount.toFixed(2)} ${currency}`;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [usageLoading, setUsageLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [userPlan, setUserPlan] = useState<UserPlanState>({
    plan: "free",
    dailyLimit: FREE_DAILY_LIMIT,
    expiredAt: null,
  });

  const [usedCount, setUsedCount] = useState(0);
  const [orders, setOrders] = useState<ProOrder[]>([]);

  const dailyLimit = userPlan.dailyLimit;
  const remainingCount = Math.max(dailyLimit - usedCount, 0);
  const usagePercent =
    dailyLimit > 0 ? Math.min((usedCount / dailyLimit) * 100, 100) : 0;

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setUsageLoading(true);
      setOrdersLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        setUsageLoading(false);
        setOrdersLoading(false);
        window.location.replace("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);

      const { data: planData, error: planError } = await supabase
        .from("user_plans")
        .select("plan,daily_limit,expired_at")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      let finalPlan: UserPlanState = {
        plan: "free",
        dailyLimit: FREE_DAILY_LIMIT,
        expiredAt: null,
      };

      if (planError) {
        console.error("读取用户套餐失败：", planError);
      } else if (planData) {
        const dbPlan = planData.plan === "pro" ? "pro" : "free";
        const dbDailyLimit = Number(planData.daily_limit || FREE_DAILY_LIMIT);
        const expiredAt = planData.expired_at
          ? String(planData.expired_at)
          : null;

        const isExpired = expiredAt
          ? new Date(expiredAt).getTime() <= Date.now()
          : false;

        if (!isExpired) {
          finalPlan = {
            plan: dbPlan,
            dailyLimit:
              Number.isFinite(dbDailyLimit) && dbDailyLimit > 0
                ? dbDailyLimit
                : FREE_DAILY_LIMIT,
            expiredAt,
          };
        }
      }

      setUserPlan(finalPlan);

      const today = getTodayDate();

      const { data: usageData, error: usageError } = await supabase
        .from("user_daily_usage")
        .select("used_count")
        .eq("user_id", session.user.id)
        .eq("usage_date", today)
        .maybeSingle();

      if (!mounted) return;

      if (usageError) {
        console.error("读取今日使用次数失败：", usageError);
        setUsedCount(0);
      } else {
        setUsedCount(Number(usageData?.used_count || 0));
      }

      setUsageLoading(false);

      const { data: orderData, error: orderError } = await supabase
        .from("pro_orders")
        .select(
          "id, plan_name, amount_cents, currency, daily_limit, expired_at, status, email_sent, created_at"
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!mounted) return;

      if (orderError) {
        console.error("读取 Pro 开通记录失败：", orderError);
        setOrders([]);
      } else {
        setOrders((orderData || []) as ProOrder[]);
      }

      setOrdersLoading(false);
    }

    loadDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        window.location.replace("/login");
        return;
      }

      setUser(session.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    setLogoutLoading(true);

    try {
      await Promise.race([
        supabase.auth.signOut({
          scope: "local",
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    } catch (error) {
      console.error("退出登录失败：", error);
    }

    if (typeof window !== "undefined") {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          window.localStorage.removeItem(key);
        }
      });

      Object.keys(window.sessionStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          window.sessionStorage.removeItem(key);
        }
      });

      window.location.href = "/login";
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-6 text-center">
          <div className="text-lg font-black">正在加载会员中心...</div>
          <p className="mt-2 text-sm text-white/50">请稍等</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/" className="hover:text-white">
                首页
              </Link>
              <Link href="/chat" className="hover:text-white">
                AI 工具
              </Link>
              <Link href="/pricing" className="hover:text-white">
                套餐价格
              </Link>
              <Link href="/checkout" className="hover:text-white">
                升级 Pro
              </Link>
              <Link href="/contact" className="hover:text-white">
                联系我们
              </Link>
            </div>
          </nav>

          <div className="py-14">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              会员中心
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              欢迎回来，
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                管理你的 AI Bot Pro 账号。
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              在这里可以查看账号信息、当前套餐、今日 AI 使用次数、剩余次数和 Pro 开通记录，也可以直接升级、续费或提交付款确认。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">账号信息</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-sm text-white/45">登录邮箱</div>
                <div className="mt-2 break-all text-lg font-black">
                  {user?.email || "未获取到邮箱"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-sm text-white/45">用户 ID</div>
                <div className="mt-2 break-all text-sm font-bold text-white/70">
                  {user?.id || "未获取到用户 ID"}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  userPlan.plan === "pro"
                    ? "border-purple-400/30 bg-purple-500/10"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <div className="text-sm text-white/45">当前套餐</div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="text-2xl font-black">
                    {getPlanName(userPlan.plan)}
                  </div>

                  {userPlan.plan === "pro" && (
                    <div className="rounded-full border border-purple-300/30 bg-purple-400/10 px-3 py-1 text-xs font-black text-purple-200">
                      PRO
                    </div>
                  )}
                </div>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {getPlanDesc(userPlan.plan, dailyLimit)}
                </p>

                {userPlan.expiredAt && userPlan.plan === "pro" && (
                  <p className="mt-2 text-xs text-white/45">
                    到期时间：{formatTime(userPlan.expiredAt)}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/checkout"
                    className={
                      userPlan.plan === "pro"
                        ? "rounded-2xl border border-purple-300/30 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/20"
                        : "rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
                    }
                  >
                    {userPlan.plan === "pro" ? "续费 Pro" : "升级 Pro"}
                  </Link>

                  <Link
                    href="/pricing"
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white/80 transition hover:border-white/30"
                  >
                    查看套餐
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black">我的 Pro 开通记录</h2>

              <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-100">
                {orders.length} 条
              </div>
            </div>

            {ordersLoading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/50">
                正在读取开通记录...
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/50">
                暂时没有 Pro 开通记录。开通 Pro 后，这里会显示套餐和到期时间。你也可以先去提交付款确认。
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-black">
                          {order.plan_name}
                        </div>

                        <div className="mt-1 text-sm text-white/50">
                          {formatAmount(order.amount_cents, order.currency)}
                        </div>
                      </div>

                      <div
                        className={
                          order.status === "active"
                            ? "rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200"
                            : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/60"
                        }
                      >
                        {order.status === "active" ? "有效中" : order.status}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-2">
                      <div>
                        <span className="text-white/40">每日额度：</span>
                        {order.daily_limit} 次
                      </div>

                      <div>
                        <span className="text-white/40">邮件通知：</span>
                        {order.email_sent ? (
                          <span className="text-emerald-200">已发送</span>
                        ) : (
                          <span className="text-yellow-200">未发送</span>
                        )}
                      </div>

                      <div>
                        <span className="text-white/40">开通时间：</span>
                        {formatTime(order.created_at)}
                      </div>

                      <div>
                        <span className="text-white/40">到期时间：</span>
                        {formatTime(order.expired_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">今日使用次数</h2>

            {usageLoading ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-white/50">
                正在读取今日次数...
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <div className="text-sm text-white/45">今日已用</div>
                    <div className="mt-2 text-4xl font-black">
                      {usedCount} / {dailyLimit}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <div className="text-sm text-white/45">今日剩余</div>
                    <div className="mt-2 text-4xl font-black text-emerald-300">
                      {remainingCount}
                    </div>
                  </div>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      userPlan.plan === "pro" ? "bg-purple-300" : "bg-white"
                    }`}
                    style={{
                      width: `${usagePercent}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-white/45">
                  次数每天自动刷新。当前套餐：{getPlanName(userPlan.plan)}。
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">快捷操作</h2>

            <div className="mt-6 grid gap-4">
              <Link
                href="/chat"
                className="rounded-2xl bg-white px-5 py-4 text-center font-black text-black transition hover:bg-white/90"
              >
                进入 AI 工具箱
              </Link>

              <Link
                href="/pricing"
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center font-bold text-white transition hover:border-white/30"
              >
                查看套餐价格
              </Link>

              <Link
                href="/checkout"
                className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-center font-black text-emerald-100 transition hover:bg-emerald-500/20"
              >
                升级 / 续费 Pro
              </Link>

              <Link
                href="/waitlist"
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center font-bold text-white transition hover:border-white/30"
              >
                商务定制 / 人工咨询
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center font-black text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoutLoading ? "退出中..." : "退出登录"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}