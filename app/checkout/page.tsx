"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const plans = [
  {
    name: "Pro 月卡",
    price: "¥19.9",
    desc: "适合短期体验和个人轻度使用",
    highlight: "30 天有效",
  },
  {
    name: "Pro 年卡",
    price: "¥199",
    desc: "适合长期使用，性价比更高",
    highlight: "365 天有效",
  },
  {
    name: "试用 Pro",
    price: "¥0",
    desc: "适合先体验 Pro 能力",
    highlight: "7 天试用",
  },
  {
    name: "团队方案",
    price: "联系确认",
    desc: "适合团队、工作室或企业使用",
    highlight: "人工定制",
  },
];

const paymentMethods = ["微信支付", "支付宝", "银行卡转账", "其他方式"];

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0].name);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [paymentProof, setPaymentProof] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

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
          name,
          email,
          company,
          plan: selectedPlan,
          paymentMethod,
          paymentProof,
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
setMessage("");

window.location.href = "/checkout/success";
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

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

              <Link href="/waitlist" className="hover:text-white">
                申请 Pro
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
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">选择套餐</h2>

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

          <div className="mt-6 rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-6">
            <h2 className="text-xl font-black text-yellow-100">提交说明</h2>

            <div className="mt-4 space-y-2 text-sm leading-7 text-yellow-100/75">
              <p>1. 请先完成付款，再提交付款确认。</p>
              <p>2. 付款截图可以填写图片链接，也可以填写“已发客服微信”。</p>
              <p>3. 管理员审核后，会通过后台为你的账号开通 Pro。</p>
              <p>4. 如果你未登录提交，后台会尝试用邮箱匹配你的账号。</p>
            </div>
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
                {selectedPlan}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  称呼
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
                  邮箱
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
                付款截图链接 / 付款凭证说明
              </label>
              <textarea
                value={paymentProof}
                onChange={(event) => setPaymentProof(event.target.value)}
                rows={4}
                placeholder="比如：截图链接，或者填写：已发客服微信，付款备注为 xxx"
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
              disabled={submitting}
              className="w-full rounded-2xl bg-white px-6 py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "提交中..." : "提交付款确认"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-white/40">
            已提交过申请？
            <Link href="/dashboard" className="ml-1 text-white hover:underline">
              返回会员中心
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}