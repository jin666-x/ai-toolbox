import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
          页面不存在
        </div>

        <h1 className="mt-8 text-7xl font-black tracking-tight md:text-9xl">
          404
        </h1>

        <h2 className="mt-6 text-3xl font-black md:text-5xl">
          你访问的页面没有找到
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          这个页面可能已经被删除、地址输入错误，或者暂时不可访问。
          你可以返回首页，或者直接进入 AI 工具箱继续使用。
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            返回首页
          </Link>

          <Link
            href="/chat"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
          >
            进入 AI 工具箱
          </Link>

          <Link
            href="/pricing"
            className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 text-lg font-bold text-purple-100 transition hover:bg-purple-500/30"
          >
            查看套餐
          </Link>
        </div>
      </section>
    </main>
  );
}