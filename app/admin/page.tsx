"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProApplication = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  plan: string;
  status: string;
  created_at: string;
};

type ProOrder = {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  plan_name: string;
  amount_cents: number;
  currency: string;
  status: string;
  expired_at: string | null;
  created_at: string;
};

type DashboardStats = {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  contactedApplications: number;
  rejectedApplications: number;
  totalOrders: number;
  activeOrders: number;
  expiredOrders: number;
  refundedOrders: number;
  cancelledOrders: number;
  totalMessages: number;
  revenueCents: number;
};

type DashboardResponse = {
  success: boolean;
  stats: DashboardStats;
  recentApplications: ProApplication[];
  recentOrders: ProOrder[];
  error?: string;
};

const adminCards = [
  {
    title: "套餐管理",
    desc: "手动为用户开通 Free / Pro，设置每日额度和到期时间。",
    href: "/admin/plans",
    badge: "用户套餐",
    className: "border-emerald-300/20 bg-emerald-500/10",
  },
  {
    title: "提交记录",
    desc: "查看 Pro 申请、联系反馈，一键开通 Pro，复制用户 ID。",
    href: "/admin/submissions",
    badge: "申请审核",
    className: "border-purple-300/20 bg-purple-500/10",
  },
  {
    title: "开通记录",
    desc: "查看 Pro 订单记录，停用、恢复、标记退款、检查过期 Pro。",
    href: "/admin/orders",
    badge: "订单记录",
    className: "border-blue-300/20 bg-blue-500/10",
  },
];

const quickLinks = [
  {
    title: "会员中心",
    href: "/dashboard",
  },
  {
    title: "AI 工具",
    href: "/chat",
  },
  {
    title: "价格页",
    href: "/pricing",
  },
  {
    title: "申请 Pro",
    href: "/waitlist",
  },
];

const statusMap: Record<
  string,
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
  active: {
    label: "生效中",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  expired: {
    label: "已过期",
    className: "border-yellow-400/20 bg-yellow-400/10 text-yellow-200",
  },
  refunded: {
    label: "已退款",
    className: "border-red-400/20 bg-red-400/10 text-red-200",
  },
  cancelled: {
    label: "已停用",
    className: "border-zinc-400/20 bg-zinc-400/10 text-zinc-200",
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

function formatMoney(cents: number, currency = "CNY") {
  const amount = (Number(cents) || 0) / 100;

  if (currency === "CNY") {
    return `¥${amount.toFixed(2)}`;
  }

  return `${currency} ${amount.toFixed(2)}`;
}

function getStatusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status || "未知",
      className: "border-white/10 bg-white/5 text-white/60",
    }
  );
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<
    ProApplication[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<ProOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/dashboard", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as DashboardResponse;

      if (!res.ok) {
        throw new Error(data.error || "读取后台统计失败");
      }

      setStats(data.stats);
      setRecentApplications(data.recentApplications || []);
      setRecentOrders(data.recentOrders || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "读取后台统计失败，请稍后再试。"
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
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "总申请数",
      value: stats ? String(stats.totalApplications) : "-",
      desc: "所有 Pro 申请记录",
      className: "border-purple-300/20 bg-purple-500/10",
    },
    {
      title: "待处理申请",
      value: stats ? String(stats.pendingApplications) : "-",
      desc: "需要你尽快处理",
      className: "border-yellow-300/20 bg-yellow-500/10",
    },
    {
      title: "已开通 Pro",
      value: stats ? String(stats.approvedApplications) : "-",
      desc: "申请已审核通过",
      className: "border-emerald-300/20 bg-emerald-500/10",
    },
    {
      title: "开通记录",
      value: stats ? String(stats.totalOrders) : "-",
      desc: "Pro 订单/开通流水",
      className: "border-blue-300/20 bg-blue-500/10",
    },
    {
      title: "生效中 Pro",
      value: stats ? String(stats.activeOrders) : "-",
      desc: "当前仍在生效",
      className: "border-cyan-300/20 bg-cyan-500/10",
    },
    {
      title: "预估收入",
      value: stats ? formatMoney(stats.revenueCents) : "-",
      desc: "不含已退款/已停用",
      className: "border-orange-300/20 bg-orange-500/10",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/admin" className="text-white">
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

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
              >
                退出后台
              </button>
            </div>
          </nav>

          <div className="py-16 md:py-24">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              AI Bot Pro 管理后台
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              后台控制台
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                数据看板、申请审核和 Pro 管理
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里是后台统一入口。你可以快速查看申请数量、开通记录、预估收入和最近用户动态。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "刷新中..." : "刷新数据"}
              </button>

              <Link
                href="/admin/submissions"
                className="rounded-2xl border border-purple-300/20 bg-purple-500/10 px-6 py-3 font-black text-purple-100 transition hover:bg-purple-500/20"
              >
                去处理申请
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-6 py-3 font-black text-emerald-100 transition hover:bg-emerald-500/20"
              >
                查看开通记录
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-10">
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((item) => (
            <div
              key={item.title}
              className={`rounded-[2rem] border p-6 ${item.className}`}
            >
              <div className="text-sm font-bold text-white/50">
                {item.title}
              </div>

              <div className="mt-3 text-4xl font-black tracking-tight">
                {loading ? "..." : item.value}
              </div>

              <div className="mt-3 text-sm text-white/50">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {adminCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-[2rem] border p-7 transition hover:-translate-y-1 ${card.className}`}
            >
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-white/70">
                {card.badge}
              </div>

              <h2 className="text-3xl font-black">{card.title}</h2>

              <p className="mt-4 min-h-20 leading-7 text-white/60">
                {card.desc}
              </p>

              <div className="mt-8 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition group-hover:bg-zinc-200">
                进入管理 →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">最近 5 条 Pro 申请</h2>
                <p className="mt-2 text-sm text-white/50">
                  快速查看最新提交的申请。
                </p>
              </div>

              <Link
                href="/admin/submissions"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10"
              >
                查看全部
              </Link>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/50">
                正在读取最近申请...
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/50">
                暂时没有申请记录。
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((item) => {
                  const status = getStatusInfo(item.status);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-black">{item.name}</div>
                          <div className="mt-1 text-sm text-white/45">
                            {item.email}
                          </div>
                        </div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/50">
                        <span>{item.plan}</span>
                        <span>{formatTime(item.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">最近 5 条开通记录</h2>
                <p className="mt-2 text-sm text-white/50">
                  快速查看最新 Pro 开通流水。
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10"
              >
                查看全部
              </Link>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/50">
                正在读取最近开通记录...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/50">
                暂时没有开通记录。
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((item) => {
                  const status = getStatusInfo(item.status);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-black">
                            {item.name || item.email}
                          </div>
                          <div className="mt-1 text-sm text-white/45">
                            {item.email}
                          </div>
                        </div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/50">
                        <span>{item.plan_name}</span>
                        <span>{formatMoney(item.amount_cents, item.currency)}</span>
                      </div>

                      <div className="mt-2 text-xs text-white/35">
                        {formatTime(item.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">快捷入口</h2>
              <p className="mt-2 text-sm text-white/50">
                快速查看前台页面，确认用户看到的内容是否正常。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center font-black text-white transition hover:bg-white/10"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-7">
          <h2 className="text-2xl font-black text-yellow-100">使用提醒</h2>

          <div className="mt-4 space-y-2 text-sm leading-7 text-yellow-100/75">
            <p>1. 用户申请 Pro 后，优先去「提交记录」查看。</p>
            <p>2. 有用户 ID 的申请，可以直接点「一键开通 Pro」。</p>
            <p>3. 没有用户 ID 的申请，可以尝试「按邮箱开通 Pro」。</p>
            <p>4. 开通后可以去「开通记录」查看订单和到期时间。</p>
            <p>5. 如果用户退款或违规，可以在「开通记录」里停用 Pro。</p>
          </div>
        </div>
      </section>
    </main>
  );
}