"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderStatus = "active" | "expired" | "refunded" | "cancelled";

type OrderFilter =
  | "all"
  | "active"
  | "expiring_soon"
  | "expired"
  | "refunded"
  | "cancelled"
  | "email_not_sent"
  | "missing_user_id";

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

type ResendEmailResponse = {
  success?: boolean;
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

const sourceMap: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  manual_admin: {
    label: "后台手动开通",
    className: "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
  },
  manual_admin_email_match: {
    label: "按邮箱匹配开通",
    className: "border-blue-300/20 bg-blue-500/10 text-blue-100",
  },
  admin: {
    label: "后台开通",
    className: "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
  },
  system: {
    label: "系统创建",
    className: "border-purple-300/20 bg-purple-500/10 text-purple-100",
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

function getSourceInfo(source: string) {
  return (
    sourceMap[source] || {
      label: source || "未记录来源",
      className: "border-white/10 bg-white/5 text-white/60",
    }
  );
}

function getExpireInfo(value: string | null, status: OrderStatus) {
  if (!value) {
    return {
      label: "长期有效",
      desc: "未设置到期时间",
      className: "border-blue-300/20 bg-blue-500/10 text-blue-100",
      daysLeft: null as number | null,
    };
  }

  const expiredAt = new Date(value).getTime();

  if (Number.isNaN(expiredAt)) {
    return {
      label: "时间异常",
      desc: value,
      className: "border-red-300/20 bg-red-500/10 text-red-100",
      daysLeft: null as number | null,
    };
  }

  const now = Date.now();
  const diff = expiredAt - now;
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (status === "expired" || diff <= 0) {
    return {
      label: "已到期",
      desc: "建议检查是否已自动降级",
      className: "border-yellow-300/20 bg-yellow-500/10 text-yellow-100",
      daysLeft,
    };
  }

  if (daysLeft <= 3) {
    return {
      label: `${daysLeft} 天内到期`,
      desc: "建议提醒用户续费",
      className: "border-red-300/20 bg-red-500/10 text-red-100",
      daysLeft,
    };
  }

  if (daysLeft <= 7) {
    return {
      label: `${daysLeft} 天后到期`,
      desc: "即将到期",
      className: "border-orange-300/20 bg-orange-500/10 text-orange-100",
      daysLeft,
    };
  }

  return {
    label: `${daysLeft} 天后到期`,
    desc: "正常生效中",
    className: "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
    daysLeft,
  };
}

function isExpiringSoon(item: ProOrder) {
  if (!item.expired_at || item.status !== "active") return false;

  const diff = new Date(item.expired_at).getTime() - Date.now();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return daysLeft > 0 && daysLeft <= 7;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ProOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [resendingId, setResendingId] = useState("");
  const [checkingExpired, setCheckingExpired] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const stats = useMemo(() => {
    const revenueCents = orders
      .filter((item) => item.status !== "refunded" && item.status !== "cancelled")
      .reduce((sum, item) => sum + (Number(item.amount_cents) || 0), 0);

    return {
      total: orders.length,
      active: orders.filter((item) => item.status === "active").length,
      expired: orders.filter((item) => item.status === "expired").length,
      refunded: orders.filter((item) => item.status === "refunded").length,
      cancelled: orders.filter((item) => item.status === "cancelled").length,
      emailNotSent: orders.filter((item) => !item.email_sent).length,
      expiringSoon: orders.filter((item) => isExpiringSoon(item)).length,
      revenueCents,
    };
  }, [orders]);

  const filteredOrders = orders.filter((item) => {
    const matchFilter =
      orderFilter === "all" ||
      (orderFilter === "active" && item.status === "active") ||
      (orderFilter === "expiring_soon" && isExpiringSoon(item)) ||
      (orderFilter === "expired" && item.status === "expired") ||
      (orderFilter === "refunded" && item.status === "refunded") ||
      (orderFilter === "cancelled" && item.status === "cancelled") ||
      (orderFilter === "email_not_sent" && !item.email_sent) ||
      (orderFilter === "missing_user_id" && !item.user_id);

    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return matchFilter;
    }

    const searchableText = [
      item.id,
      item.application_id || "",
      item.user_id || "",
      item.email,
      item.name || "",
      item.plan_name,
      item.currency,
      item.status,
      item.source,
      String(item.email_sent),
      String(item.amount_cents || 0),
      String(item.daily_limit || 0),
      item.expired_at || "",
      item.created_at,
      item.updated_at,
    ]
      .join(" ")
      .toLowerCase();

    return matchFilter && searchableText.includes(keyword);
  });

  const filterOptions: {
    key: OrderFilter;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "全部订单",
      count: orders.length,
    },
    {
      key: "active",
      label: "生效中",
      count: stats.active,
    },
    {
      key: "expiring_soon",
      label: "7天内到期",
      count: stats.expiringSoon,
    },
    {
      key: "expired",
      label: "已过期",
      count: stats.expired,
    },
    {
      key: "email_not_sent",
      label: "未发邮件",
      count: stats.emailNotSent,
    },
    {
      key: "refunded",
      label: "已退款",
      count: stats.refunded,
    },
    {
      key: "cancelled",
      label: "已停用",
      count: stats.cancelled,
    },
    {
      key: "missing_user_id",
      label: "无用户 ID",
      count: orders.filter((item) => !item.user_id).length,
    },
  ];

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

  async function resendOpenEmail(orderId: string) {
    if (resendingId) return;

    const confirmed = window.confirm("确定要重新发送 Pro 开通邮件吗？");

    if (!confirmed) return;

    setResendingId(orderId);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/orders/resend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          orderId,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as ResendEmailResponse;

      if (!res.ok) {
        throw new Error(data.error || "重发邮件失败");
      }

      if (data.order) {
        setOrders((prev) =>
          prev.map((item) => (item.id === data.order?.id ? data.order : item))
        );
      }

      setNotice(data.message || "Pro 开通邮件已重新发送。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "重发邮件失败，请稍后再试。");
    } finally {
      setResendingId("");
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

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label}已复制。`);
      setError("");
    } catch {
      setError(`复制${label}失败，请手动选中复制。`);
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

  const statCards = [
    {
      title: "总订单",
      value: String(stats.total),
      desc: "全部 Pro 开通记录",
      className: "border-blue-300/20 bg-blue-500/10",
    },
    {
      title: "生效中",
      value: String(stats.active),
      desc: "当前仍在生效",
      className: "border-emerald-300/20 bg-emerald-500/10",
    },
    {
      title: "7天内到期",
      value: String(stats.expiringSoon),
      desc: "建议主动提醒续费",
      className: "border-orange-300/20 bg-orange-500/10",
    },
    {
      title: "未发邮件",
      value: String(stats.emailNotSent),
      desc: "可手动重发开通邮件",
      className: "border-yellow-300/20 bg-yellow-500/10",
    },
    {
      title: "有效收入",
      value: formatMoney(stats.revenueCents),
      desc: "不含退款/停用订单",
      className: "border-purple-300/20 bg-purple-500/10",
    },
  ];

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

              <Link href="/admin/settings" className="hover:text-white">
                后台配置
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
                订单、到期、邮件通知一屏管理
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里会显示后台一键开通 Pro 后生成的记录。你可以筛选、搜索、停用、退款、恢复 Pro、复制信息，也可以手动重发开通邮件。
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

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((item) => (
            <div
              key={item.title}
              className={`rounded-[1.5rem] border p-5 ${item.className}`}
            >
              <div className="text-sm font-bold text-white/50">
                {item.title}
              </div>

              <div className="mt-3 text-3xl font-black tracking-tight">
                {loading ? "..." : item.value}
              </div>

              <div className="mt-2 text-xs leading-5 text-white/45">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Pro 开通记录</h2>

            <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-100">
              当前 {filteredOrders.length} 条 / 全部 {orders.length} 条
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {filterOptions.map((item) => {
              const active = orderFilter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setOrderFilter(item.key)}
                  className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/30 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={
                      active ? "ml-2 text-black/60" : "ml-2 text-white/35"
                    }
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="搜索邮箱、姓名、套餐、用户 ID、订单 ID、状态、来源、邮件..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
              />
            </div>

            {searchKeyword ? (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
              >
                清空搜索
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
              正在读取 Pro 开通记录...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
              暂时没有 Pro 开通记录。你需要先去「提交记录」里点一键开通 Pro。
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
              当前筛选或搜索条件下没有订单记录。
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((item) => {
                const currentStatus = statusMap[item.status] || statusMap.active;
                const sourceInfo = getSourceInfo(item.source);
                const expireInfo = getExpireInfo(item.expired_at, item.status);
                const isUpdating = updatingId === item.id;
                const isResending = resendingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-xl font-black">
                            {item.name || item.email}
                          </div>

                          <div
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${currentStatus.className}`}
                          >
                            {currentStatus.label}
                          </div>

                          <div
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${sourceInfo.className}`}
                          >
                            {sourceInfo.label}
                          </div>

                          {item.email_sent ? (
                            <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-100">
                              邮件已发
                            </div>
                          ) : (
                            <div className="rounded-full border border-yellow-300/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-100">
                              邮件未发
                            </div>
                          )}

                          {!item.user_id ? (
                            <div className="rounded-full border border-yellow-300/30 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-100">
                              无用户 ID
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-2 text-sm text-white/50">
                          {item.email}
                        </div>
                      </div>

                      <div className={`rounded-2xl border px-4 py-3 text-right ${expireInfo.className}`}>
                        <div className="text-sm font-black">{expireInfo.label}</div>
                        <div className="mt-1 text-xs opacity-70">
                          {expireInfo.desc}
                        </div>
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
                        <span className="text-white/40">更新时间：</span>
                        {formatTime(item.updated_at)}
                      </div>

                      <div>
                        <span className="text-white/40">邮件通知：</span>
                        {item.email_sent ? "已发送" : "未发送"}
                      </div>

                      <div>
                        <span className="text-white/40">来源：</span>
                        {sourceInfo.label}
                      </div>

                      <div className="break-all">
                        <span className="text-white/40">订单 ID：</span>
                        {item.id}
                      </div>

                      <div className="break-all">
                        <span className="text-white/40">申请 ID：</span>
                        {item.application_id || "未记录"}
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
                        onClick={() => copyText(item.email, "邮箱")}
                        className="rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-zinc-200"
                      >
                        复制邮箱
                      </button>

                      {item.user_id ? (
                        <button
                          type="button"
                          onClick={() => copyText(item.user_id || "", "用户 ID")}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10"
                        >
                          复制用户 ID
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => copyText(item.id, "订单 ID")}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10"
                      >
                        复制订单 ID
                      </button>

                      <button
                        type="button"
                        disabled={isResending}
                        onClick={() => resendOpenEmail(item.id)}
                        className="rounded-full border border-blue-300/20 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-100 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isResending ? "发送中..." : "重发开通邮件"}
                      </button>

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

                    {isResending ? (
                      <div className="mt-3 text-xs text-blue-200/70">
                        正在重发 Pro 开通邮件...
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
