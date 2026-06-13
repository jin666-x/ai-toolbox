"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderStatus = "active" | "expired" | "refunded" | "cancelled";

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
  status: OrderStatus;
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

type UpdateOrderResponse = {
  success: boolean;
  message?: string;
  order?: ProOrder;
  error?: string;
};

const statusMap: Record<
  OrderStatus,
  {
    label: string;
    className: string;
  }
> = {
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

function formatTime(value: string | null) {
  if (!value) return "长期有效 / 未设置";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ProOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [checkingExpired, setCheckingExpired] = useState(false);
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
        throw new Error(data.error || "读取开通记录失败");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "读取开通记录失败，请稍后再试。"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    if (updatingId) return;

    const confirmed = window.confirm(
      status === "active"
        ? "确定要恢复这个用户的 Pro 吗？"
        : "确定要更新订单状态吗？如果改成停用/退款/过期，用户会同步降级为 Free。"
    );

    if (!confirmed) return;

    setUpdatingId(orderId);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as UpdateOrderResponse;

      if (!res.ok) {
        throw new Error(data.error || "更新订单失败");
      }

      if (data.order) {
        setOrders((prev) =>
          prev.map((item) => (item.id === data.order?.id ? data.order : item))
        );
      }

      setNotice(data.message || "订单状态已更新。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败，请稍后再试。");
    } finally {
      setUpdatingId("");
    }
  }

  async function checkExpiredPro() {
    if (checkingExpired) return;

    setCheckingExpired(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/expire-pro", {
        method: "POST",
        credentials: "same-origin",
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        expiredCount?: number;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "检查过期 Pro 失败");
      }

      setNotice(
        data.message ||
          `检查完成，本次处理 ${data.expiredCount || 0} 个过期 Pro。`
      );

      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "检查过期 Pro 失败，请稍后再试。"
      );
    } finally {
      setCheckingExpired(false);
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.26),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.22),transparent_35%)]" />

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

              <Link href="/admin/orders" className="text-white">
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

          <div className="py-14">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              管理后台
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              开通记录
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                查看 Pro 订单和会员状态
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里会显示后台一键开通 Pro 后生成的记录。你可以停用、退款、恢复 Pro，也可以手动检查过期会员。
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

              <button
                type="button"
                onClick={checkExpiredPro}
                disabled={checkingExpired}
                className="rounded-2xl border border-yellow-300/20 bg-yellow-500/10 px-6 py-3 font-black text-yellow-100 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkingExpired ? "检查中..." : "手动检查过期 Pro"}
              </button>

              <Link
                href="/admin/submissions"
                className="rounded-2xl border border-purple-300/20 bg-purple-500/10 px-6 py-3 font-black text-purple-100 transition hover:bg-purple-500/20"
              >
                去审核申请
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
              正在读取 Pro 开通记录...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
              暂时没有 Pro 开通记录。你需要先去「提交记录」里点一键开通 Pro。
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((item) => {
                const currentStatus = statusMap[item.status] || statusMap.active;
                const isUpdating = updatingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-black">
                          {item.name || item.email}
                        </div>
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
                        {item.plan_name}
                      </div>

                      <div>
                        <span className="text-white/40">金额：</span>
                        {formatMoney(item.amount_cents, item.currency)}
                      </div>

                      <div>
                        <span className="text-white/40">每日额度：</span>
                        {item.daily_limit} 次
                      </div>

                      <div>
                        <span className="text-white/40">到期时间：</span>
                        {formatTime(item.expired_at)}
                      </div>

                      <div>
                        <span className="text-white/40">开通时间：</span>
                        {formatTime(item.created_at)}
                      </div>

                      <div>
                        <span className="text-white/40">邮件通知：</span>
                        {item.email_sent ? "已发送" : "未发送"}
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-white/40">用户 ID：</span>
                        {item.user_id ? (
                          <span className="break-all text-emerald-200">
                            {item.user_id}
                          </span>
                        ) : (
                          <span className="text-yellow-200">未记录</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isUpdating || item.status === "active"}
                        onClick={() => updateOrderStatus(item.id, "active")}
                        className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        恢复 Pro
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || item.status === "cancelled"}
                        onClick={() => updateOrderStatus(item.id, "cancelled")}
                        className="rounded-full border border-zinc-400/20 bg-zinc-500/10 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        停用 Pro
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || item.status === "refunded"}
                        onClick={() => updateOrderStatus(item.id, "refunded")}
                        className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        标记退款
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || item.status === "expired"}
                        onClick={() => updateOrderStatus(item.id, "expired")}
                        className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-200 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        标记过期
                      </button>
                    </div>

                    {isUpdating ? (
                      <div className="mt-3 text-xs text-white/40">
                        正在更新订单状态...
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}