"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AuditLog = {
  id: string;
  admin_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

type AuditResponse = {
  success?: boolean;
  logs?: AuditLog[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  error?: string;
};

const actionLabels: Record<string, string> = {
  approve_pro: "审核开通 Pro",
  update_plan: "修改套餐",
  stop_order: "停用订单",
  restore_order: "恢复订单",
  refund_order: "标记退款",
  expire_order: "标记过期",
  resend_email: "重发邮件",
  update_settings: "修改站点配置",
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

function getActionLabel(action: string) {
  return actionLabels[action] || action;
}

function stringifyMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "无";
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return "无法显示";
  }
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState("");
  const [targetId, setTargetId] = useState("");

  const totalText = useMemo(() => {
    if (loading) return "读取中...";
    return `${logs.length} 条记录`;
  }, [loading, logs.length]);

  async function loadLogs() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (action.trim()) {
        params.set("action", action.trim());
      }

      if (targetId.trim()) {
        params.set("targetId", targetId.trim());
      }

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        cache: "no-store",
        credentials: "same-origin",
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as AuditResponse;

      if (!res.ok) {
        throw new Error(data.error || "读取后台操作日志失败。");
      }

      setLogs(data.logs || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "读取后台操作日志失败，请稍后再试。"
      );
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
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/admin" className="hover:text-white">
                后台首页
              </Link>

              <Link href="/admin/plans" className="hover:text-white">
                套餐管理
              </Link>

              <Link href="/admin/submissions" className="hover:text-white">
                提交记录
              </Link>

              <Link href="/admin/orders" className="hover:text-white">
                开通记录
              </Link>

              <Link href="/admin/settings" className="hover:text-white">
                后台配置
              </Link>

              <Link href="/admin/audit-logs" className="text-white">
                操作日志
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
              后台安全
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              后台操作日志
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                记录关键操作，方便追踪问题
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              后续审核开通、修改套餐、退款、停用、重发邮件、修改配置等操作都会记录在这里。
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10 md:px-8 lg:px-10">
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">日志筛选</h2>
              <p className="mt-1 text-sm text-white/45">{totalText}</p>
            </div>

            <button
              type="button"
              onClick={loadLogs}
              disabled={loading}
              className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "刷新中..." : "刷新日志"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
              placeholder="按 action 筛选，例如 approve_pro"
            />

            <input
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
              placeholder="按目标 ID 筛选"
            />

            <button
              type="button"
              onClick={loadLogs}
              disabled={loading}
              className="rounded-2xl border border-blue-300/20 bg-blue-500/10 px-6 py-3 font-black text-blue-100 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              查询
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-white/60">
            正在读取操作日志...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-7 text-yellow-100">
            暂时没有操作日志。接入具体后台操作后，这里会开始显示记录。
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-black">
                      {getActionLabel(log.action)}
                    </div>

                    <div className="mt-2 text-sm text-white/45">
                      {formatTime(log.created_at)}
                    </div>
                  </div>

                  <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-white/55">
                    {log.action}
                  </div>
                </div>

                <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-1 text-white/35">管理员</div>
                    <div className="break-all text-white/80">
                      {log.admin_email || "未知"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-1 text-white/35">目标类型</div>
                    <div className="break-all text-white/80">
                      {log.target_type || "无"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-1 text-white/35">目标 ID</div>
                    <div className="break-all text-white/80">
                      {log.target_id || "无"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-1 text-white/35">IP</div>
                    <div className="break-all text-white/80">
                      {log.ip || "未知"}
                    </div>
                  </div>
                </div>

                {log.description ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/70">
                    {log.description}
                  </div>
                ) : null}

                <details className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-white/70">
                    查看 metadata
                  </summary>

                  <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap break-all text-xs leading-6 text-white/55">
                    {stringifyMetadata(log.metadata)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
