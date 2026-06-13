"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  plan: "Pro 月卡",
  useCase: "",
  message: "",
};

const proBenefits = [
  {
    title: "每日 100 次",
    desc: "适合高频生成文案、脚本、标题、广告词。",
  },
  {
    title: "会员中心显示",
    desc: "开通后可在会员中心查看 Pro 状态和剩余次数。",
  },
  {
    title: "人工开通权限",
    desc: "提交申请后，我们会联系你并为账号开通权限。",
  },
];

export default function WaitlistPage() {
  const [form, setForm] = useState<WaitlistForm>(initialForm);
  const [userId, setUserId] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);
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

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          setUserId(data.user.id);

          if (data.user.email) {
            setForm((prev) => ({
              ...prev,
              email: prev.email || data.user?.email || "",
            }));
          }
        }
      } catch (error) {
        console.error("读取登录用户失败：", error);
      } finally {
        setCheckingUser(false);
      }
    }

    loadUser();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setStatus(null);

    if (!form.name.trim()) {
      setStatus({
        type: "error",
        message: "请填写你的称呼。",
      });
      setLoading(false);
      return;
    }

    if (!form.email.trim()) {
      setStatus({
        type: "error",
        message: "请填写邮箱地址，方便后续联系。",
      });
      setLoading(false);
      return;
    }

    if (!form.useCase.trim()) {
      setStatus({
        type: "error",
        message: "请选择主要使用场景。",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          userId: userId || null,
          message: `【Pro 申请信息】
用户ID：${userId || "未登录 / 未获取到用户 ID"}
称呼：${form.name}
邮箱：${form.email}
微信/公司/团队：${form.company || "未填写"}
申请套餐：${form.plan}
使用场景：${form.useCase || "未选择"}

补充说明：
${form.message || "未填写"}`,
        }),
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
        message:
          data.message ||
          "提交成功，我们已经收到你的 Pro 申请，后续会通过邮箱联系你。",
      });

      setForm((prev) => ({
        ...initialForm,
        email: prev.email,
      }));
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
              <div className="mb-5 inline-flex rounded-full border border-purple-300/30 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-100">
                Pro 会员申请
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                申请开通 Pro，
                <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                  解锁每日 100 次额度。
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                当前 Pro 会员先采用人工开通方式。提交申请后，我们会收到邮件通知，
                确认后为你的账号开通 Pro 权限。
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {proBenefits.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="text-2xl font-black">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-purple-300/20 bg-purple-500/10 p-5">
                <div className="text-xl font-black text-purple-100">
                  申请流程
                </div>

                <div className="mt-4 space-y-3 text-sm leading-7 text-purple-100/75">
                  <p>1. 先登录账号，再提交 Pro 会员申请。</p>
                  <p>2. 系统会自动记录你的用户 ID。</p>
                  <p>3. 管理员确认后，可以直接为该账号开通 Pro。</p>
                  <p>4. 开通后进入会员中心和 AI 工具页，即可看到 Pro 额度。</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-5 shadow-2xl shadow-purple-950/30 backdrop-blur md:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div
                  className={
                    userId
                      ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-200"
                      : "rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-7 text-yellow-100"
                  }
                >
                  {checkingUser
                    ? "正在读取登录账号..."
                    : userId
                    ? `已识别登录账号，用户 ID：${userId}`
                    : "当前未登录。建议先登录账号再提交申请，这样后台可以直接识别你的用户 ID。"}
                </div>

                {!userId && !checkingUser ? (
                  <Link
                    href="/login"
                    className="block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-sm font-black text-white transition hover:bg-white/10"
                  >
                    去登录账号
                  </Link>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    你的称呼
                  </label>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="比如：张先生"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    邮箱地址
                  </label>
                  <input
                    type="email"
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
                    微信 / 公司 / 团队名称
                  </label>
                  <input
                    value={form.company}
                    onChange={(event) =>
                      updateField("company", event.target.value)
                    }
                    placeholder="可填写微信号，方便联系"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    想开通的套餐
                  </label>
                  <select
                    value={form.plan}
                    onChange={(event) =>
                      updateField("plan", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#090909] px-5 py-4 text-white outline-none transition focus:border-white/30"
                  >
                    <option value="Pro 月卡">Pro 月卡 ￥19.9 / 月</option>
                    <option value="Pro 年卡">Pro 年卡 ￥199 / 年</option>
                    <option value="先试用 Pro">先试用 Pro</option>
                    <option value="团队 / 定制方案">团队 / 定制方案</option>
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
                    <option value="短视频脚本">短视频脚本</option>
                    <option value="营销广告">营销广告</option>
                    <option value="代码开发">代码开发</option>
                    <option value="团队办公">团队办公</option>
                    <option value="副业赚钱">副业赚钱</option>
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
                    placeholder="比如：预计每天使用多少次、主要做什么内容、是否需要长期使用。"
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-white px-6 py-4 text-lg font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "提交中..." : "提交 Pro 申请"}
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