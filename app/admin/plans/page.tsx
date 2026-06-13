"use client";

import Link from "next/link";
import { useState } from "react";

type PlanType = "free" | "pro";

export default function AdminPlansPage() {
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState<PlanType>("pro");
  const [dailyLimit, setDailyLimit] = useState(100);
  const [expiredAt, setExpiredAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function setFreePlan() {
    setPlan("free");
    setDailyLimit(10);
    setExpiredAt("");
  }

  function setProPlan() {
    setPlan("pro");
    setDailyLimit(100);
  }

  async function handleLogout() {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/set-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          userId,
          plan,
          dailyLimit,
          expiredAt: expiredAt || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "保存失败");
      }

      setMessage("套餐保存成功！");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/admin/plans" className="text-white">
                套餐管理
              </Link>

              <Link href="/admin/submissions" className="hover:text-white">
                提交记录
              </Link>

              <Link href="/admin/orders" className="hover:text-white">
                开通记录
              </Link>

              <Link href="/dashboard" className="hover:text-white">
                会员中心
              </Link>

              <Link href="/chat" className="hover:text-white">
                AI 工具
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoutLoading ? "退出中..." : "退出后台"}
              </button>
            </div>
          </nav>

          <div className="py-14">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              管理后台
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              用户套餐管理
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                给用户开通 Free / Pro
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              输入用户 ID，选择套餐和每日次数，即可给指定用户开通或修改会员权限。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-10 md:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
        >
          <h2 className="text-2xl font-black">设置用户套餐</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                管理员密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="填写 ADMIN_SECRET"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                用户 ID
              </label>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="从会员中心复制用户 ID"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                套餐类型
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={setFreePlan}
                  className={`rounded-2xl border px-5 py-4 font-black transition ${
                    plan === "free"
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/30 text-white hover:border-white/30"
                  }`}
                >
                  Free 免费版
                </button>

                <button
                  type="button"
                  onClick={setProPlan}
                  className={`rounded-2xl border px-5 py-4 font-black transition ${
                    plan === "pro"
                      ? "border-purple-300/40 bg-purple-500/20 text-purple-100"
                      : "border-white/10 bg-black/30 text-white hover:border-white/30"
                  }`}
                >
                  Pro 会员版
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                每日可用次数
              </label>
              <input
                type="number"
                min={1}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value || 1))}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                到期时间，可不填
              </label>
              <input
                type="datetime-local"
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-white/30"
              />
              <p className="mt-2 text-xs text-white/40">
                不填就是长期有效。填写后，到期会自动按 Free 免费版处理。
              </p>
            </div>

            {message && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white px-5 py-4 font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "保存中..." : "保存套餐"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">使用说明</h2>

            <div className="mt-6 space-y-4 text-sm leading-7 text-white/60">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="font-black text-white">怎么找用户 ID？</div>
                <p className="mt-2">
                  让用户登录后进入会员中心，复制页面里的用户 ID。
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="font-black text-white">Free 免费版</div>
                <p className="mt-2">建议每日次数填 10。</p>
              </div>

              <div className="rounded-2xl border border-purple-300/20 bg-purple-500/10 p-5">
                <div className="font-black text-purple-100">Pro 会员版</div>
                <p className="mt-2">建议每日次数填 100，后面也可以改成更多。</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6 text-yellow-100">
            <h2 className="text-xl font-black">注意</h2>
            <p className="mt-3 text-sm leading-7 text-yellow-100/80">
              这个页面不要放到公开导航栏里，只给你自己用。当前后台已经加了二次访问保护，
              退出后台后需要重新通过 admin_key 进入。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}