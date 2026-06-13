"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ApplicationStatus = "pending" | "contacted" | "approved" | "rejected";

type ApplicationFilter =
  | "all"
  | "pending"
  | "approved"
  | "payment"
  | "normal"
  | "missing_user_id";

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

type ApproveProResponse = {
  success: boolean;
  message?: string;
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

function getPlanTag(plan: string) {
  if (plan.includes("月")) {
    return {
      label: "Pro 月卡",
      className: "border-purple-400/30 bg-purple-500/15 text-purple-100",
      cardClass: "border-purple-400/20 bg-purple-500/[0.07]",
    };
  }

  if (plan.includes("年")) {
    return {
      label: "Pro 年卡",
      className: "border-blue-400/30 bg-blue-500/15 text-blue-100",
      cardClass: "border-blue-400/20 bg-blue-500/[0.07]",
    };
  }

  if (plan.includes("试用")) {
    return {
      label: "试用 Pro",
      className: "border-yellow-400/30 bg-yellow-500/15 text-yellow-100",
      cardClass: "border-yellow-400/20 bg-yellow-500/[0.07]",
    };
  }

  if (plan.includes("团队") || plan.includes("定制")) {
    return {
      label: "团队方案",
      className: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
      cardClass: "border-emerald-400/20 bg-emerald-500/[0.07]",
    };
  }

  return {
    label: plan || "未选择套餐",
    className: "border-white/10 bg-white/5 text-white/70",
    cardClass: "border-white/10 bg-black/30",
  };
}

function parsePaymentMessage(message: string | null, useCase: string) {
  const raw = message || "";
  const isPayment =
    raw.includes("【付款确认】") || useCase.includes("付款确认");

  if (!isPayment) {
    return null;
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const paymentMethod =
    lines
      .find((line) => line.startsWith("付款方式："))
      ?.replace("付款方式：", "")
      .trim() ||
    useCase.replace("付款确认 -", "").trim() ||
    "未识别";

  const paymentProof =
    lines
      .find((line) => line.startsWith("付款凭证："))
      ?.replace("付款凭证：", "")
      .trim() || "未填写";

  const extraMessage =
    lines
      .find((line) => line.startsWith("补充说明："))
      ?.replace("补充说明：", "")
      .trim() || "未填写";

  return {
    paymentMethod,
    paymentProof,
    extraMessage,
  };
}

function isPaymentApplication(item: ProApplication) {
  return Boolean(parsePaymentMessage(item.message, item.use_case));
}

function isLink(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export default function AdminSubmissionsPage() {
  const [applications, setApplications] = useState<ProApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [applicationFilter, setApplicationFilter] =
    useState<ApplicationFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [approvingId, setApprovingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filteredApplications = applications.filter((item) => {
    const paymentInfo = parsePaymentMessage(item.message, item.use_case);

    const matchFilter =
      applicationFilter === "all" ||
      (applicationFilter === "pending" && item.status === "pending") ||
      (applicationFilter === "approved" && item.status === "approved") ||
      (applicationFilter === "payment" && isPaymentApplication(item)) ||
      (applicationFilter === "normal" && !isPaymentApplication(item)) ||
      (applicationFilter === "missing_user_id" && !item.user_id);

    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return matchFilter;
    }

    const searchableText = [
      item.name,
      item.email,
      item.company || "",
      item.plan,
      item.use_case,
      item.message || "",
      item.user_id || "",
      paymentInfo?.paymentMethod || "",
      paymentInfo?.paymentProof || "",
      paymentInfo?.extraMessage || "",
    ]
      .join(" ")
      .toLowerCase();

    return matchFilter && searchableText.includes(keyword);
  });

  const filterOptions: {
    key: ApplicationFilter;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "全部",
      count: applications.length,
    },
    {
      key: "pending",
      label: "待处理",
      count: applications.filter((item) => item.status === "pending").length,
    },
    {
      key: "approved",
      label: "已开通",
      count: applications.filter((item) => item.status === "approved").length,
    },
    {
      key: "payment",
      label: "付款确认",
      count: applications.filter((item) => isPaymentApplication(item)).length,
    },
    {
      key: "normal",
      label: "普通申请",
      count: applications.filter((item) => !isPaymentApplication(item)).length,
    },
    {
      key: "missing_user_id",
      label: "无用户 ID",
      count: applications.filter((item) => !item.user_id).length,
    },
  ];

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

  async function approvePro(applicationId: string) {
    if (approvingId) return;

    const confirmed = window.confirm(
      "确定要开通 Pro 吗？如果这条申请没有用户 ID，系统会尝试按邮箱匹配已注册账号。"
    );

    if (!confirmed) return;

    setApprovingId(applicationId);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/applications/approve-pro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          applicationId,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("后台接口返回异常，请重新通过 admin_key 进入后台。");
      }

      const data = (await res.json()) as ApproveProResponse;

      if (!res.ok) {
        throw new Error(data.error || "一键开通失败");
      }

      if (data.application) {
        const updatedApplication = data.application;

        setApplications((prev) =>
          prev.map((item) =>
            item.id === updatedApplication.id ? updatedApplication : item
          )
        );
      }

      setNotice(data.message || "已成功开通 Pro。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "一键开通失败，请稍后再试。");
    } finally {
      setApprovingId("");
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

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setNotice("邮箱已复制。");
      setError("");
    } catch {
      setError("复制失败，请手动选中邮箱复制。");
    }
  }

  async function copyPaymentProof(paymentProof: string) {
    try {
      await navigator.clipboard.writeText(paymentProof);
      setNotice("付款凭证已复制。");
      setError("");
    } catch {
      setError("复制失败，请手动选中付款凭证复制。");
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
              <Link href="/admin" className="hover:text-white">
                后台首页
              </Link>

              <Link href="/admin/plans" className="hover:text-white">
                套餐管理
              </Link>

              <Link href="/admin/submissions" className="text-white">
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
                查看 Pro 申请和付款确认
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里会显示用户提交的 Pro 会员申请、付款确认和联系反馈，支持一键开通、按邮箱开通、标记状态和复制用户 ID。
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Pro 申请记录</h2>

              <div className="rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-sm font-bold text-purple-100">
                当前 {filteredApplications.length} 条 / 全部 {applications.length} 条
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {filterOptions.map((item) => {
                const active = applicationFilter === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setApplicationFilter(item.key)}
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
                  placeholder="搜索姓名、邮箱、套餐、用户 ID、付款方式、付款凭证..."
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
                正在读取 Pro 申请记录...
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
                暂时没有 Pro 申请记录。
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/60">
                当前筛选或搜索条件下没有记录。
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((item) => {
                  const currentStatus =
                    statusMap[item.status] || statusMap.pending;
                  const planTag = getPlanTag(item.plan);
                  const paymentInfo = parsePaymentMessage(
                    item.message,
                    item.use_case
                  );
                  const isUpdating = updatingId === item.id;
                  const isApproving = approvingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-3xl border p-5 ${planTag.cardClass}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-xl font-black">
                              {item.name}
                            </div>

                            <div
                              className={`rounded-full border px-3 py-1 text-xs font-black ${planTag.className}`}
                            >
                              {planTag.label}
                            </div>

                            {paymentInfo ? (
                              <div className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-100">
                                付款确认
                              </div>
                            ) : null}

                            {!item.user_id ? (
                              <div className="rounded-full border border-yellow-300/30 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-100">
                                无用户 ID
                              </div>
                            ) : null}
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
                          <span className="text-white/40">申请套餐：</span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${planTag.className}`}
                          >
                            {item.plan}
                          </span>
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
                              未记录，系统会尝试按邮箱匹配已注册账号
                            </span>
                          )}
                        </div>
                      </div>

                      {paymentInfo ? (
                        <div className="mt-4 space-y-3">
                          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-sm font-black text-emerald-100">
                                付款确认信息
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  copyPaymentProof(paymentInfo.paymentProof)
                                }
                                className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                              >
                                复制付款凭证
                              </button>
                            </div>

                            <div className="grid gap-3 text-sm text-emerald-100/80 md:grid-cols-2">
                              <div>
                                <span className="text-emerald-100/45">
                                  付款方式：
                                </span>
                                {paymentInfo.paymentMethod}
                              </div>

                              <div>
                                <span className="text-emerald-100/45">
                                  付款凭证：
                                </span>
                                {isLink(paymentInfo.paymentProof) ? (
                                  <a
                                    href={paymentInfo.paymentProof}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="break-all text-white underline underline-offset-4"
                                  >
                                    打开截图链接
                                  </a>
                                ) : (
                                  <span className="break-all">
                                    {paymentInfo.paymentProof}
                                  </span>
                                )}
                              </div>

                              <div className="md:col-span-2">
                                <span className="text-emerald-100/45">
                                  补充说明：
                                </span>
                                {paymentInfo.extraMessage}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-white/40">
                            原始内容：
                            <pre className="mt-2 whitespace-pre-wrap break-words font-sans">
                              {item.message || "未填写"}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/65">
                          {item.message || "未填写补充说明"}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isApproving || item.status === "approved"}
                          onClick={() => approvePro(item.id)}
                          className="rounded-full border border-emerald-300/30 bg-emerald-400 px-5 py-2 text-xs font-black text-black shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isApproving
                            ? "开通中..."
                            : item.status === "approved"
                            ? "已开通"
                            : item.user_id
                            ? "一键开通 Pro"
                            : "按邮箱开通 Pro"}
                        </button>

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
                          onClick={() => copyEmail(item.email)}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10"
                        >
                          复制邮箱
                        </button>

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

                      {isApproving ? (
                        <div className="mt-3 text-xs text-emerald-300/70">
                          正在开通 Pro...
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