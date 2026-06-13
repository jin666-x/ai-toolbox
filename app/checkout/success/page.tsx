import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_35%)]" />

      <SiteHeader />

      <section className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500/15 text-4xl">
          ✓
        </div>

        <div className="mb-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-500/10 px-5 py-2 text-sm font-bold text-emerald-100">
          付款确认已提交
        </div>

        <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
          已收到你的 Pro 付款确认
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          管理员会尽快核对付款信息。审核通过后，你的账号会被开通 Pro
          权限，并收到邮件通知。
        </p>

        <div className="mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-2xl font-black">1</div>
            <div className="mt-2 font-bold">等待审核</div>
            <div className="mt-2 text-sm leading-6 text-zinc-500">
              管理员核对你的付款信息
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-2xl font-black">2</div>
            <div className="mt-2 font-bold">开通 Pro</div>
            <div className="mt-2 text-sm leading-6 text-zinc-500">
              审核通过后自动写入会员权限
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-2xl font-black">3</div>
            <div className="mt-2 font-bold">邮件通知</div>
            <div className="mt-2 text-sm leading-6 text-zinc-500">
              开通成功后会发送通知邮件
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            查看会员中心
          </Link>

          <Link
            href="/chat"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
          >
            先去使用 AI 工具
          </Link>

          <Link
            href="/checkout"
            className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-8 py-4 text-lg font-black text-emerald-100 transition hover:bg-emerald-500/20"
          >
            重新提交
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}