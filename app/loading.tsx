import Link from "next/link";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_35%)]" />

      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
        <Link href="/" className="inline-flex text-2xl font-black">
          AI Bot Pro
        </Link>

        <div className="mx-auto mt-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>

        <h1 className="mt-8 text-4xl font-black">正在加载</h1>

        <p className="mt-4 leading-7 text-zinc-400">
          AI Bot Pro 正在为你加载页面，请稍等片刻。
        </p>

        <div className="mt-8 grid gap-3">
          <div className="h-3 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
        </div>
      </section>
    </main>
  );
}