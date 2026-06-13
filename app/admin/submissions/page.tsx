"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProApplication = {
  id: string;
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

type ContactMessage = {
  id: string;
  email: string;
  type: string;
  message: string;
  created_at: string;
};

type SubmissionsResponse = {
  success: boolean;
  applications: ProApplication[];
  messages: ContactMessage[];
  error?: string;
};

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour12: false,
    });
  } catch {
    return value;
  }
}

export default function AdminSubmissionsPage() {
  const [applications, setApplications] = useState<ProApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/submissions", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as SubmissionsResponse;

      if (!res.ok) {
        throw new Error(data.error || "读取失败");
      }

      setApplications(data.applications || []);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/admin/plans" className="hover:text-white">
                套餐管理
              </Link>

              <Link href="/admin/submissions" className="text-white">
                提交记录
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
                className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
              >
                退出后台
              </button>
            </div>
          </nav>

          <div className="py-14">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              管理后台
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              提交记录
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                查看 Pro 申请和联系反馈
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里会显示用户提交的 Pro 会员申请和联系反馈，数据来自 Supabase。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "刷新中..." : "刷新记录"}
              </button>

              <Link
                href="/admin/plans"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white transition hover:bg-white/10"
              >
                去开通套餐
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10 md:px-8 lg:px-10">
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Pro 申请记录</h2>

              <div className="rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-sm font-bold text-purple-100">
                {applications.length} 条
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
                正在读取 Pro 申请记录...
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
                暂时没有 Pro 申请记录。
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-black">{item.name}</div>
                        <div className="mt-1 text-sm text-white/50">
                          {item.email}
                        </div>
                      </div>

                      <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-200">
                        {item.status || "pending"}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-2">
                      <div>
                        <span className="text-white/40">套餐：</span>
                        {item.plan}
                      </div>

                      <div>
                        <span className="text-white/40">场景：</span>
                        {item.use_case}
                      </div>

                      <div>
                        <span className="text-white/40">微信/公司：</span>
                        {item.company || "未填写"}
                      </div>

                      <div>
                        <span className="text-white/40">时间：</span>
                        {formatTime(item.created_at)}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/65">
                      {item.message || "未填写补充说明"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">联系反馈记录</h2>

              <div className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-100">
                {messages.length} 条
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
                正在读取联系反馈记录...
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
                暂时没有联系反馈记录。
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black">{item.type}</div>
                        <div className="mt-1 text-sm text-white/50">
                          {item.email}
                        </div>
                      </div>

                      <div className="text-xs text-white/40">
                        {formatTime(item.created_at)}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/65">
                      {item.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}