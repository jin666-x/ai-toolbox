"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ApplicationStatus = "pending" | "contacted" | "approved" | "rejected";

type ProApplication = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  company: string | null;
  plan: string;
  use_case: string;
  message: string | null;
  status: ApplicationStatus;
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

type UpdateStatusResponse = {
  success: boolean;
  application?: ProApplication;
  error?: string;
};

const statusMap: Record<
  ApplicationStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "待处理",
    className: "border-yellow-400/20 bg-yellow-400/10 text-yellow-200",
  },
  contacted: {
    label: "已联系",
    className: "border-blue-400/20 bg-blue-400/10 text-blue-200",
  },
  approved: {
    label: "已开通",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  rejected: {
    label: "已拒绝",
    className: "border-red-400/20 bg-red-400/10 text-red-200",
  },
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
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    setNotice("");

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

  async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
  ) {
    if (updatingId) return;

    setUpdatingId(applicationId);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/applications/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          applicationId,
          status,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as UpdateStatusResponse;

      if (!res.ok) {
        throw new Error(data.error || "更新失败");
      }

      if (data.application) {
        setApplications((prev) =>
          prev.map((item) =>
            item.id === data.application?.id ? data.application : item
          )
        );

        setNotice("申请状态更新成功。");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败，请稍后再试。");
    } finally {
      setUpdatingId("");
    }
  }

  async function copyUserId(userId: string) {
    try {
      await navigator.clipboard.writeText(userId);
      setNotice("用户 ID 已复制。");
      setError("");
    } catch {
      setError("复制失败，请手动选中用户 ID 复制。");
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

        {notice ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-200">
            {notice}
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
                {applications.map((item) => {
                  const currentStatus =
                    statusMap[item.status] || statusMap.pending;
                  const isUpdating = updatingId === item.id;

                  return (
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

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${currentStatus.className}`}
                        >
                          {currentStatus.label}
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

                        <div className="md:col-span-2">
                          <span className="text-white/40">用户 ID：</span>
                          {item.user_id ? (
                            <span className="break-all text-emerald-200">
                              {item.user_id}
                            </span>
                          ) : (
                            <span className="text-yellow-200">
                              未记录，可能是旧申请或用户未登录
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/65">
                        {item.message || "未填写补充说明"}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.user_id ? (
                          <button
                            type="button"
                            onClick={() => copyUserId(item.user_id || "")}
                            className="rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-zinc-200"
                          >
                            复制用户 ID
                          </button>
                        ) : null}

                        <button
                          type="button"
                          disabled={isUpdating || item.status === "contacted"}
                          onClick={() =>
                            updateApplicationStatus(item.id, "contacted")
                          }
                          className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          标记已联系
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || item.status === "approved"}
                          onClick={() =>
                            updateApplicationStatus(item.id, "approved")
                          }
                          className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          标记已开通
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || item.status === "rejected"}
                          onClick={() =>
                            updateApplicationStatus(item.id, "rejected")
                          }
                          className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          标记已拒绝
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || item.status === "pending"}
                          onClick={() =>
                            updateApplicationStatus(item.id, "pending")
                          }
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          重新待处理
                        </button>
                      </div>

                      {isUpdating ? (
                        <div className="mt-3 text-xs text-white/40">
                          正在更新状态...
                        </div>
                      ) : null}
                    </div>
                  );
                })}
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