"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const LOGIN_DAILY_LIMIT = 10;

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [usedCount, setUsedCount] = useState(0);
  const [usageLoading, setUsageLoading] = useState(true);

  const remainingCount = Math.max(LOGIN_DAILY_LIMIT - usedCount, 0);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setUsageLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        setUsageLoading(false);
        window.location.replace("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);

      const today = getTodayDate();

      const { data, error } = await supabase
        .from("user_daily_usage")
        .select("used_count")
        .eq("user_id", session.user.id)
        .eq("usage_date", today)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("读取今日使用次数失败：", error);
        setUsedCount(0);
      } else {
        setUsedCount(Number(data?.used_count || 0));
      }

      setUsageLoading(false);
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
              <Link href="/waitlist" className="hover:text-white">
                等待名单
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
              在这里可以查看账号信息、今日 AI 使用次数和当前套餐状态。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
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

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-sm text-white/45">当前套餐</div>
              <div className="mt-2 text-lg font-black">Free 免费版</div>
              <p className="mt-2 text-sm leading-6 text-white/50">
                当前登录账号每日可使用 {LOGIN_DAILY_LIMIT} 次 AI 工具。
              </p>
            </div>
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
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="text-sm text-white/45">今日已用</div>
                  <div className="mt-2 text-4xl font-black">
                    {usedCount} / {LOGIN_DAILY_LIMIT}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="text-sm text-white/45">今日剩余</div>
                  <div className="mt-2 text-4xl font-black text-emerald-300">
                    {remainingCount}
                  </div>
                  <p className="mt-2 text-sm text-white/50">
                    次数每天自动刷新。
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: `${Math.min(
                        (usedCount / LOGIN_DAILY_LIMIT) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
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
                href="/waitlist"
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center font-bold text-white transition hover:border-white/30"
              >
                申请 Pro / 加入等待名单
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