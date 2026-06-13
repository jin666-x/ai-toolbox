"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProOrder = {
  id: string;
  application_id: string | null;
  user_id: string | null;
  email: string;
  name: string | null;
  plan_name: string;
  amount_cents: number;
  currency: string;
  daily_limit: number;
  expired_at: string | null;
  status: string;
  source: string;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
};

type OrdersResponse = {
  success: boolean;
  orders: ProOrder[];
  error?: string;
};

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ProOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as OrdersResponse;

      if (!res.ok) {
        throw new Error(data.error || "读取失败");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`${label}已复制。`);
      setError("");
    } catch {
      setError("复制失败，请手动选中文本复制。");
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
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/admin/plans" className="hover:text-white">
                套餐管理
              </Link>

              <Link href="/admin/submissions" className="hover:text-white">
                提交记录
              </Link>

              <Link href="/admin/orders" className="text-white">
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
                className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
              >
                退出后台
              </button>
            </div>
          </nav>

          <div className="py-14">
            <div className="mb-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
              Pro 开通记录
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              开通记录
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                查看所有 Pro 订单和开通历史
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里展示所有通过后台一键开通的 Pro 记录，包括用户邮箱、套餐、金额、到期时间和邮件通知状态。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "刷新中..." : "刷新记录"}
              </button>

              <Link
                href="/admin/submissions"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white transition hover:bg-white/10"
              >
                去看申请
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

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Pro 开通记录</h2>

            <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-100">
              {orders.length} 条
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
              正在读取开通记录...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
              暂时没有 Pro 开通记录。
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-black/30 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-black">
                        {order.name || "未填写称呼"}
                      </div>

                      <div className="mt-1 text-sm text-white/50">
                        {order.email}
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

                  <div className="mt-5 grid gap-3 text-sm text-white/70 md:grid-cols-2">
                    <div>
                      <span className="text-white/40">套餐：</span>
                      {order.plan_name}
                    </div>

                    <div>
                      <span className="text-white/40">金额：</span>
                      {formatAmount(order.amount_cents, order.currency)}
                    </div>

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

                    <div className="md:col-span-2">
                      <span className="text-white/40">用户 ID：</span>
                      {order.user_id ? (
                        <span className="break-all text-emerald-200">
                          {order.user_id}
                        </span>
                      ) : (
                        <span className="text-yellow-200">未记录</span>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-white/40">申请 ID：</span>
                      {order.application_id ? (
                        <span className="break-all text-white/60">
                          {order.application_id}
                        </span>
                      ) : (
                        <span className="text-yellow-200">未关联申请</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {order.user_id ? (
                      <button
                        type="button"
                        onClick={() => copyText(order.user_id || "", "用户 ID")}
                        className="rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-zinc-200"
                      >
                        复制用户 ID
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => copyText(order.email, "邮箱")}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10"
                    >
                      复制邮箱
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}