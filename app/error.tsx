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
    console.error("页面错误：", error);
  }, [error]);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full border border-red-300/20 bg-red-500/10 px-5 py-2 text-sm text-red-100 backdrop-blur-xl">
          页面出现异常
        </div>

        <h1 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">
          出错了，但问题不大
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          当前页面加载时出现了一点问题。你可以重新尝试，或者返回首页继续使用
          AI Bot Pro。
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            重新加载
          </button>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
          >
            返回首页
          </Link>

          <Link
            href="/chat"
            className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 text-lg font-bold text-purple-100 transition hover:bg-purple-500/30"
          >
            进入 AI 工具箱
          </Link>
        </div>
      </section>
    </main>
  );
}