"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const paymentMethods = ["微信支付", "支付宝", "银行卡转账", "其他方式"];

type PublicSettings = {
  customer_wechat?: string;
  payment_notice?: string;
  wechat_qr_url?: string;
  alipay_qr_url?: string;
  payment_account_name?: string;
  payment_remark_notice?: string;
  monthly_price?: string;
  yearly_price?: string;
  review_notice?: string;
  site_announcement?: string;
};

type PublicSettingsResponse = {
  success?: boolean;
  settings?: PublicSettings;
};

const defaultSettings: Required<PublicSettings> = {
  customer_wechat: "请填写客服微信",
  payment_notice: "付款后请提交付款截图或填写已发客服微信。",
  wechat_qr_url: "",
  alipay_qr_url: "",
  payment_account_name: "AI Bot Pro",
  payment_remark_notice: "付款时请备注你的登录邮箱，方便管理员核对。",
  monthly_price: "¥19.9",
  yearly_price: "¥199",
  review_notice: "管理员确认付款后会为账号开通 Pro 权限。",
  site_announcement: "AI Bot Pro 正在持续升级中。",
};

export default function CheckoutPage() {
  const [settings, setSettings] = useState<Required<PublicSettings>>(
    defaultSettings
  );

  const plans = useMemo(
    () => [
      {
        name: "Pro 月卡",
        price: settings.monthly_price,
        desc: "适合短期体验和个人轻度使用",
        highlight: "30 天有效",
        dailyLimit: "每日 100 次",
      },
      {
        name: "Pro 年卡",
        price: settings.yearly_price,
        desc: "适合长期使用，性价比更高",
        highlight: "365 天有效",
        dailyLimit: "每日 100 次",
      },
      {
        name: "试用 Pro",
        price: "¥0",
        desc: "适合先体验 Pro 能力",
        highlight: "7 天试用",
        dailyLimit: "每日 100 次",
      },
      {
        name: "团队方案",
        price: "联系确认",
        desc: "适合团队、工作室或企业使用",
        highlight: "人工定制",
        dailyLimit: "按需求定制",
      },
    ],
    [settings.monthly_price, settings.yearly_price]
  );

  const [selectedPlan, setSelectedPlan] = useState("Pro 月卡");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [paymentProof, setPaymentProof] = useState("");
  const [message, setMessage] = useState("");
  const [proofFileUrl, setProofFileUrl] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const currentPlan = useMemo(() => {
    return plans.find((item) => item.name === selectedPlan) || plans[0];
  }, [plans, selectedPlan]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = (await res.json()) as PublicSettingsResponse;

        if (data.settings) {
          setSettings({
            ...defaultSettings,
            ...data.settings,
          });
        }
      } catch (error) {
        console.error("读取站点配置失败：", error);
      } finally {
        setLoadingSettings(false);
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          setUserId(data.user.id);
          setEmail(data.user.email || "");
        }
      } catch {
        // 用户未登录也允许提交，后台可以按邮箱匹配账号
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  async function handleUploadProof(file: File) {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("付款截图只支持 PNG、JPG、WEBP 图片。");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("付款截图不能超过 5MB。");
      return;
    }

    setUploadingProof(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-payment-proof", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };

      if (!res.ok || !data.url) {
        throw new Error(data.error || "上传付款截图失败。");
      }

      setProofFileUrl(data.url);
      setProofFileName(file.name);
      setNotice("付款截图上传成功，填写信息后即可提交审核。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传付款截图失败。");
    } finally {
      setUploadingProof(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const safeName = name.trim();
    const safeEmail = email.trim();
    const safePaymentProof = paymentProof.trim();
    const finalPaymentProof = [
      proofFileUrl ? `付款截图：${proofFileUrl}` : "",
      safePaymentProof ? `补充凭证：${safePaymentProof}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!safeName) {
      setError("请填写称呼，方便管理员确认。");
      return;
    }

    if (!safeEmail) {
      setError("请填写邮箱，建议填写你的登录邮箱。");
      return;
    }

    if (!finalPaymentProof) {
      setError("请上传付款截图，或填写付款凭证说明。");
      return;
    }

    setSubmitting(true);
    setNotice("");
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: safeName,
          email: safeEmail,
          company,
          plan: selectedPlan,
          paymentMethod,
          paymentProof: finalPaymentProof,
          message,
          userId,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "提交失败，请稍后再试。");
      }

      setNotice(data.message || "提交成功，请等待人工审核。");
      setError("");
      setPaymentProof("");
      setProofFileUrl("");
      setProofFileName("");
      setMessage("");

      window.location.href = "/checkout/success";
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  const hasWechatQr = Boolean(settings.wechat_qr_url.trim());
  const hasAlipayQr = Boolean(settings.alipay_qr_url.trim());

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/pricing" className="hover:text-white">
                价格
              </Link>

              <Link href="/checkout" className="text-white">
                升级 Pro
              </Link>

              <Link href="/dashboard" className="hover:text-white">
                会员中心
              </Link>

              <Link
                href="/chat"
                className="rounded-full bg-white px-4 py-2 font-black text-black transition hover:bg-zinc-200"
              >
                立即使用
              </Link>
            </div>
          </nav>

          <div className="py-16 md:py-24">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              人工审核开通
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Pro 付款确认
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                提交后由管理员审核开通
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              当前为人工审核流程。提交付款信息后，管理员会在后台确认并为你的账号开通 Pro 权限。
            </p>

            {settings.site_announcement ? (
              <div className="mt-6 max-w-2xl rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4 text-sm leading-7 text-blue-100/80">
                {settings.site_announcement}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black">选择套餐</h2>

              {loadingSettings ? (
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/45">
                  正在读取配置...
                </div>
              ) : (
                <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-100">
                  已读取后台配置
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4">
              {plans.map((plan) => {
                const active = selectedPlan === plan.name;

                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`rounded-3xl border p-5 text-left transition ${
                      active
                        ? "border-emerald-300/40 bg-emerald-500/15"
                        : "border-white/10 bg-black/30 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-black">{plan.name}</div>
                        <div className="mt-2 text-sm leading-6 text-white/55">
                          {plan.desc}
                        </div>
                        <div className="mt-2 text-xs font-bold text-white/40">
                          {plan.dailyLimit}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black">{plan.price}</div>
                        <div className="mt-1 text-xs text-emerald-200">
                          {plan.highlight}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-6">
            <h2 className="text-xl font-black text-emerald-100">
              当前选择
            </h2>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-2xl font-black">{currentPlan.name}</div>
                  <div className="mt-2 text-sm leading-6 text-white/55">
                    {currentPlan.desc}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-100">
                    {currentPlan.price}
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    {currentPlan.highlight}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-purple-400/20 bg-purple-500/10 p-6">
            <h2 className="text-xl font-black text-purple-100">收款信息</h2>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-5">
              <div className="text-sm text-white/45">收款人</div>
              <div className="mt-1 text-2xl font-black">
                {settings.payment_account_name}
              </div>

              <p className="mt-3 text-sm leading-7 text-purple-100/75">
                {settings.payment_remark_notice}
              </p>
            </div>

            {hasWechatQr || hasAlipayQr ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {hasWechatQr ? (
                  <div className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                    <div className="mb-3 text-center text-sm font-black text-emerald-100">
                      微信收款码
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
                      <img
                        src={settings.wechat_qr_url}
                        alt="微信收款二维码"
                        className="aspect-square w-full rounded-xl object-contain"
                      />
                    </div>
                  </div>
                ) : null}

                {hasAlipayQr ? (
                  <div className="rounded-3xl border border-blue-300/20 bg-blue-500/10 p-4">
                    <div className="mb-3 text-center text-sm font-black text-blue-100">
                      支付宝收款码
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
                      <img
                        src={settings.alipay_qr_url}
                        alt="支付宝收款二维码"
                        className="aspect-square w-full rounded-xl object-contain"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-yellow-300/20 bg-yellow-500/10 p-5 text-sm leading-7 text-yellow-100/75">
                还没有配置收款二维码。你可以在后台配置页填写微信或支付宝收款二维码图片链接。
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-6">
            <h2 className="text-xl font-black text-yellow-100">付款流程</h2>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-yellow-300/10 bg-black/25 p-4">
                <div className="font-black text-yellow-100">1. 先完成付款</div>
                <p className="mt-1 text-sm leading-6 text-yellow-100/70">
                  按页面提示选择付款方式。付款金额以你选择的套餐为准。
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-300/10 bg-black/25 p-4">
                <div className="font-black text-yellow-100">
                  2. 填写付款凭证
                </div>
                <p className="mt-1 text-sm leading-6 text-yellow-100/70">
                  可以填写截图链接，也可以填写“已发客服微信”。
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-300/10 bg-black/25 p-4">
                <div className="font-black text-yellow-100">
                  3. 等待审核开通
                </div>
                <p className="mt-1 text-sm leading-6 text-yellow-100/70">
                  {settings.review_notice}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-purple-400/20 bg-purple-500/10 p-6">
            <h2 className="text-xl font-black text-purple-100">付款说明</h2>

            <div className="mt-4 space-y-3 text-sm leading-7 text-purple-100/75">
              <p>{settings.payment_notice}</p>

              <p>
                客服微信：
                <span className="ml-1 font-black text-white">
                  {settings.customer_wechat}
                </span>
              </p>

              <p>
                如果你还没有登录，建议先登录再提交，后台可以直接绑定你的用户 ID。
              </p>
            </div>

            {!userId ? (
              <Link
                href="/login"
                className="mt-4 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
              >
                先登录账号
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black">填写付款确认</h2>
            <p className="mt-2 text-sm text-white/50">
              {loadingUser
                ? "正在读取登录状态..."
                : userId
                ? "已检测到你的登录账号，提交后后台可直接开通。"
                : "当前未检测到登录账号，后台会尝试按邮箱匹配。"}
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {notice ? (
            <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {notice}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                当前套餐
              </label>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 font-black text-emerald-100">
                {selectedPlan} · {currentPlan.price}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  称呼 <span className="text-red-300">*</span>
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="比如：张三"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  邮箱 <span className="text-red-300">*</span>
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="你的登录邮箱"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                微信 / 公司 / 团队
              </label>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="选填，方便管理员联系你"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                付款方式
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((item) => {
                  const active = paymentMethod === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPaymentMethod(item)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                        active
                          ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
                          : "border-white/10 bg-black/30 text-white/60 hover:bg-white/[0.06]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                上传付款截图 <span className="text-red-300">*</span>
              </label>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadingProof}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      handleUploadProof(file);
                    }
                  }}
                  className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-black file:text-black hover:file:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-3 text-xs leading-6 text-white/45">
                  支持 PNG / JPG / WEBP，最大 5MB。上传成功后，后台会看到图片链接。
                </p>

                {uploadingProof ? (
                  <div className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4 text-sm font-bold text-blue-100">
                    正在上传付款截图...
                  </div>
                ) : null}

                {proofFileUrl ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                    <div className="mb-3 text-sm font-black text-emerald-100">
                      上传成功：{proofFileName || "付款截图"}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
                      <img
                        src={proofFileUrl}
                        alt="付款截图"
                        className="max-h-80 w-full rounded-xl object-contain"
                      />
                    </div>

                    <div className="mt-3 break-all text-xs leading-6 text-emerald-100/70">
                      {proofFileUrl}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                付款凭证说明
              </label>
              <textarea
                value={paymentProof}
                onChange={(event) => setPaymentProof(event.target.value)}
                rows={4}
                placeholder="选填，比如：已付款，付款备注是你的邮箱，或者已发客服微信"
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/70">
                补充说明
              </label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="选填，比如你的使用需求、付款时间、备注信息"
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingProof}
              className="w-full rounded-2xl bg-white px-6 py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingProof ? "截图上传中..." : submitting ? "提交中..." : "提交付款确认"}
            </button>
          </form>

          <div className="mt-5 grid gap-3 text-center text-sm sm:grid-cols-2">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              返回会员中心
            </Link>

            <Link
              href="/chat"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              先体验 AI 工具
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
