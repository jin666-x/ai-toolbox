"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalEmail = email.trim();
    const finalPassword = password.trim();

    if (!finalEmail) {
      setStatus({
        type: "error",
        message: "请填写邮箱地址。",
      });
      return;
    }

    if (finalPassword.length < 6) {
      setStatus({
        type: "error",
        message: "密码至少需要 6 位。",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password: finalPassword,
        });

        if (error) {
          setStatus({
            type: "error",
            message: "登录失败，请检查邮箱或密码是否正确。",
          });
          return;
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: finalEmail,
        password: finalPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setStatus({
          type: "error",
          message: error.message || "注册失败，请稍后再试。",
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          "注册成功。如果系统要求邮箱验证，请先去邮箱点击验证链接，然后再回来登录。",
      });

      setMode("login");
      setPassword("");
    } catch {
      setStatus({
        type: "error",
        message: "操作失败，请检查网络后再试。",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_35%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-8 lg:px-10">
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
              <Link href="/waitlist" className="hover:text-white">
                等待名单
              </Link>
              <Link href="/contact" className="hover:text-white">
                联系我们
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                AI Bot Pro 账号系统
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                登录你的账号，
                <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                  管理 AI 工具使用权限。
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                注册后可以进入会员中心，后续我们会继续接入使用次数、套餐状态和 Pro 权限。
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl font-black">账号登录</div>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    使用邮箱和密码登录。
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl font-black">会员中心</div>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    查看账号和后续套餐状态。
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl font-black">权限扩展</div>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    后续接入次数限制和 Pro 权限。
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/45 p-5 shadow-2xl shadow-purple-950/30 backdrop-blur md:p-7">
              <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setStatus(null);
                  }}
                  className={
                    mode === "login"
                      ? "rounded-xl bg-white px-4 py-3 text-sm font-black text-black"
                      : "rounded-xl px-4 py-3 text-sm font-bold text-white/55 hover:text-white"
                  }
                >
                  登录
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setStatus(null);
                  }}
                  className={
                    mode === "register"
                      ? "rounded-xl bg-white px-4 py-3 text-sm font-black text-black"
                      : "rounded-xl px-4 py-3 text-sm font-bold text-white/55 hover:text-white"
                  }
                >
                  注册
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    邮箱地址
                  </label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="请输入邮箱"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="至少 6 位密码"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-white px-6 py-4 text-lg font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "处理中..."
                    : mode === "login"
                      ? "登录账号"
                      : "注册账号"}
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
                  注册或登录即代表你同意{" "}
                  <Link href="/terms" className="text-white underline">
                    服务条款
                  </Link>{" "}
                  和{" "}
                  <Link href="/privacy" className="text-white underline">
                    隐私政策
                  </Link>
                  。
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}