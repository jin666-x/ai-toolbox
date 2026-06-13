"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const contactCards = [
  {
    title: "产品咨询",
    desc: "了解 AI Bot Pro 工具箱、套餐价格、Pro 权益和后续功能。",
  },
  {
    title: "问题反馈",
    desc: "如果页面异常、生成失败、次数显示异常，可以通过这里反馈。",
  },
  {
    title: "商务合作",
    desc: "后续可用于承接定制 AI 工具、企业方案、流量合作等需求。",
  },
];

type SubmitStatus = "idle" | "success" | "error";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [statusText, setStatusText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setStatus("idle");
    setStatusText("");

    if (!email.trim()) {
      setStatus("error");
      setStatusText("请填写你的邮箱，方便后续联系。");
      setLoading(false);
      return;
    }

    if (!feedbackType.trim()) {
      setStatus("error");
      setStatusText("请选择反馈类型。");
      setLoading(false);
      return;
    }

    if (!message.trim()) {
      setStatus("error");
      setStatusText("请填写具体内容。");
      setLoading(false);
      return;
    }

    if (message.length > 1000) {
      setStatus("error");
      setStatusText("内容不能超过 1000 字。");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: feedbackType,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "提交失败，请稍后再试。");
      }

      setStatus("success");
      setStatusText(data?.message || "提交成功，我们已经收到你的反馈。");

      setEmail("");
      setFeedbackType("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setStatusText(
        error instanceof Error ? error.message : "提交失败，请稍后再试。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_35%)]" />

      <SiteHeader />

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
              CONTACT US
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              联系
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                AI Bot Pro
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              如果你想了解 Pro 套餐、反馈使用问题、咨询合作或提出功能建议，
              可以通过这个页面提交。我们收到后会尽快查看，并通过你填写的邮箱联系你。
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="rounded-2xl bg-white px-8 py-4 text-center text-lg font-black text-black transition hover:bg-zinc-200"
              >
                先免费体验
              </Link>

              <Link
                href="/waitlist"
                className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 text-center text-lg font-black text-purple-100 transition hover:bg-purple-500/30"
              >
                申请 Pro 会员
              </Link>

              <Link
                href="/pricing"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
              >
                查看套餐
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-black">提交反馈</h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                填写你的邮箱、反馈类型和具体内容，我们会根据情况尽快处理。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  你的邮箱
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入你的邮箱"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  反馈类型
                </label>

                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-white/30"
                >
                  <option value="">请选择反馈类型</option>
                  <option value="产品咨询">产品咨询</option>
                  <option value="问题反馈">问题反馈</option>
                  <option value="商务合作">商务合作</option>
                  <option value="功能建议">功能建议</option>
                  <option value="Pro 会员咨询">Pro 会员咨询</option>
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-bold text-zinc-300">
                    具体内容
                  </label>

                  <span
                    className={`text-xs ${
                      message.length > 1000 ? "text-red-400" : "text-zinc-500"
                    }`}
                  >
                    {message.length} / 1000
                  </span>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                  placeholder="请输入你想反馈的内容，比如：想咨询 Pro、生成失败、次数异常、功能建议等。"
                  className={`h-32 w-full resize-none rounded-2xl border bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-600 ${
                    message.length > 1000
                      ? "border-red-500/60"
                      : "border-white/10 focus:border-white/30"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading || message.length > 1000}
                className="w-full rounded-2xl bg-white px-6 py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "提交中..." : "提交反馈"}
              </button>

              {statusText && (
                <div
                  className={`rounded-2xl border p-4 text-sm leading-6 ${
                    status === "success"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                      : "border-red-500/20 bg-red-500/10 text-red-200"
                  }`}
                >
                  {statusText}
                </div>
              )}

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm leading-6 text-purple-100/80">
                想开通 Pro 会员，也可以直接前往申请页面提交信息。
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            你可以联系我们做什么？
          </h2>

          <p className="mt-5 text-zinc-400">
            不管是产品问题、功能建议，还是后续商业合作，都可以放到这个入口。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {contactCards.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <h3 className="text-3xl font-black">{item.title}</h3>
              <p className="mt-5 leading-8 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 text-center backdrop-blur-xl md:p-16">
          <h2 className="text-4xl font-black md:text-5xl">
            先体验，再决定是否升级
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
            你可以先免费体验 AI 聊天、爆款文案、标题生成、广告优化、
            短视频脚本、SEO文章和日报周报等功能。
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              免费体验工具箱
            </Link>

            <Link
              href="/pricing"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
            >
              查看套餐价格
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
            >
              返回首页
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}