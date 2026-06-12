"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type WaitlistForm = {
  name: string;
  email: string;
  company: string;
  plan: string;
  useCase: string;
  message: string;
};

const initialForm: WaitlistForm = {
  name: "",
  email: "",
  company: "",
  plan: "",
  useCase: "",
  message: "",
};

export default function WaitlistPage() {
  const [form, setForm] = useState<WaitlistForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function updateField(key: keyof WaitlistForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.error || "提交失败，请稍后再试。",
        });
        return;
      }

      setStatus({
        type: "success",
        message: data.message || "提交成功，我们已经收到你的申请。",
      });

      setForm(initialForm);
    } catch {
      setStatus({
        type: "error",
        message: "提交失败，请检查网络后再试。",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_35%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/" className="hover:text-white">
                首页
              </Link>
              <Link href="/chat" className="hover:text-white">
                AI 工具
              </Link>
              <Link href="/pricing" className="hover:text-white">
                套餐价格
              </Link>
              <Link href="/dashboard" className="hover:text-white">
                会员中心
              </Link>
              <Link href="/contact" className="hover:text-white">
                联系我们
              </Link>
            </div>
          </nav>

          <div className="grid gap-10 py-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                Pro 申请 / 等待名单
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                申请更高额度，
                <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                  解锁完整 AI 工具箱。
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                如果你需要更高次数、更稳定的使用体验、团队账号或定制功能，可以在这里提交申请。提交后系统会自动发送邮件通知我们。
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl font-black">更高额度</div>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    适合高频使用、批量生成和日常办公。
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl font-black">团队使用</div>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    适合多人协作、内容团队和运营团队。
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl font-black">定制能力</div>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    可根据业务场景扩展专属工具。
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-5 shadow-2xl shadow-purple-950/30 backdrop-blur md:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    你的称呼
                  </label>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="比如：张先生"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    邮箱地址
                  </label>
                  <input
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="用于接收后续联系"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    公司 / 团队名称
                  </label>
                  <input
                    value={form.company}
                    onChange={(event) =>
                      updateField("company", event.target.value)
                    }
                    placeholder="可选"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    想了解的套餐
                  </label>
                  <select
                    value={form.plan}
                    onChange={(event) => updateField("plan", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#090909] px-5 py-4 text-white outline-none transition focus:border-white/30"
                  >
                    <option value="">请选择套餐</option>
                    <option value="Pro 个人版">Pro 个人版</option>
                    <option value="团队版">团队版</option>
                    <option value="企业定制版">企业定制版</option>
                    <option value="先咨询价格">先咨询价格</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    主要使用场景
                  </label>
                  <select
                    value={form.useCase}
                    onChange={(event) =>
                      updateField("useCase", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#090909] px-5 py-4 text-white outline-none transition focus:border-white/30"
                  >
                    <option value="">请选择使用场景</option>
                    <option value="内容创作">内容创作</option>
                    <option value="营销广告">营销广告</option>
                    <option value="代码开发">代码开发</option>
                    <option value="短视频脚本">短视频脚本</option>
                    <option value="团队办公">团队办公</option>
                    <option value="其他场景">其他场景</option>
                  </select>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label className="block text-sm font-bold text-white/75">
                      补充说明
                    </label>
                    <span className="text-xs text-white/35">
                      {form.message.length} / 1000
                    </span>
                  </div>

                  <textarea
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value.slice(0, 1000))
                    }
                    placeholder="比如：预计每天使用多少次、几个人使用、主要做什么内容。"
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-white px-6 py-4 text-lg font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "提交中..." : "提交申请"}
                </button>

                {status ? (
                  <div
                    className={
                      status.type === "success"
                        ? "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-bold leading-7 text-emerald-200"
                        : "rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold leading-7 text-red-200"
                    }
                  >
                    {status.message}
                  </div>
                ) : null}

                <p className="text-center text-xs leading-6 text-white/40">
                  提交后我们会通过邮件与你联系。也可以直接前往{" "}
                  <Link href="/contact" className="text-white underline">
                    联系我们
                  </Link>
                  页面留言。
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}