"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        window.location.replace("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      }
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
              当前账号系统已经接入 Supabase。下一步可以继续把免费次数、Pro 套餐和使用记录绑定到你的账号上。
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
                当前先展示账号状态。下一步可以继续把每日免费次数和 Pro 权限写入数据库。
              </p>
            </div>
          </div>
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
      </section>
    </main>
  );
}