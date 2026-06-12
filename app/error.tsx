"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AI Bot Pro 页面错误：", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_35%)]" />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-black tracking-tight">
          AI Bot Pro
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <Link href="/" className="hover:text-white">
            首页
          </Link>

          <Link href="/chat" className="hover:text-white">
            工具箱
          </Link>

          <Link href="/pricing" className="hover:text-white">
            套餐价格
          </Link>

          <Link href="/waitlist" className="hover:text-white">
            等待名单
          </Link>

          <Link href="/dashboard" className="hover:text-white">
            会员中心
          </Link>

          <Link href="/contact" className="hover:text-white">
            联系我们
          </Link>

          <Link href="/login" className="hover:text-white">
            登录
          </Link>
        </nav>

        <Link
          href="/chat"
          className="rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          免费体验
        </Link>
      </header>

      <section className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2 text-sm text-red-200 backdrop-blur-xl">
          SOMETHING WENT WRONG
        </div>

        <div className="bg-gradient-to-r from-red-400 via-orange-400 to-purple-400 bg-clip-text text-7xl font-black tracking-tight text-transparent md:text-9xl">
          500
        </div>

        <h1 className="mt-8 text-4xl font-black md:text-6xl">
          页面出错了
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          当前页面暂时无法正常加载，可能是接口异常、网络波动或页面代码错误。
          你可以重新尝试加载，返回首页，或者联系我们反馈问题。
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            重新加载
          </button>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
          >
            返回首页
          </Link>

          <Link
            href="/contact"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
          >
            联系我们
          </Link>
        </div>

        <div className="mt-12 grid w-full gap-4 text-left md:grid-cols-3">
          <Link
            href="/chat"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
          >
            <div className="text-2xl font-black">AI 工具箱</div>
            <p className="mt-3 leading-7 text-zinc-400">
              返回工具箱，继续使用文案、标题、脚本和办公工具。
            </p>
          </Link>

          <Link
            href="/contact"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
          >
            <div className="text-2xl font-black">联系我们</div>
            <p className="mt-3 leading-7 text-zinc-400">
              页面异常、功能建议、产品咨询，都可以从这里反馈。
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
          >
            <div className="text-2xl font-black">会员中心</div>
            <p className="mt-3 leading-7 text-zinc-400">
              查看会员权益和使用次数展示。
            </p>
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-white/10 px-6 py-8 text-center text-sm text-zinc-500">
        <div className="mb-4 flex flex-wrap justify-center gap-5">
          <Link href="/about" className="transition hover:text-white">
            关于我们
          </Link>

          <Link href="/contact" className="transition hover:text-white">
            联系我们
          </Link>

          <Link href="/privacy" className="transition hover:text-white">
            隐私政策
          </Link>

          <Link href="/terms" className="transition hover:text-white">
            服务条款
          </Link>

          <Link href="/pricing" className="transition hover:text-white">
            套餐价格
          </Link>

          <Link href="/waitlist" className="transition hover:text-white">
            等待名单
          </Link>

          <Link href="/dashboard" className="transition hover:text-white">
            会员中心
          </Link>

          <Link href="/login" className="transition hover:text-white">
            登录
          </Link>
        </div>

        <div>© 2026 AI Bot Pro. All rights reserved.</div>
      </footer>
    </main>
  );
}