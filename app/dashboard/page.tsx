import Link from "next/link";

const stats = [
  {
    label: "当前套餐",
    value: "免费体验版",
    desc: "后续登录后可显示真实套餐",
  },
  {
    label: "今日剩余",
    value: "5 次",
    desc: "免费版每日基础体验次数",
  },
  {
    label: "会员状态",
    value: "未开通",
    desc: "Pro 套餐即将开放",
  },
];

const benefits = [
  "更高每日使用次数",
  "支持更长内容生成",
  "优先体验新 AI 工具",
  "更多专业创作模板",
  "适合自媒体、运营、销售长期使用",
  "后续可接入订单和发票记录",
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_35%)]" />

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

          <Link href="/dashboard" className="text-white">
            会员中心
          </Link>
        </nav>

        <Link
          href="/chat"
          className="rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          免费体验
        </Link>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-16 md:pt-24">
        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
          MEMBER CENTER
        </div>

        <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
          会员中心
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            Dashboard
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
          当前为会员中心展示版本。后续接入登录、数据库和支付后，这里会显示你的套餐、
          剩余次数、订单状态、使用记录和会员权益。
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-2xl bg-white px-8 py-4 text-center text-lg font-black text-black transition hover:bg-zinc-200"
          >
            进入 AI 工具箱
          </Link>

          <Link
            href="/pricing"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
          >
            查看套餐价格
          </Link>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-6 pb-16 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="text-sm font-bold text-zinc-500">{item.label}</div>
            <div className="mt-4 text-4xl font-black">{item.value}</div>
            <div className="mt-3 leading-7 text-zinc-400">{item.desc}</div>
          </div>
        ))}
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-10">
            <div className="mb-4 text-sm font-bold text-blue-400">
              CURRENT PLAN
            </div>

            <h2 className="text-4xl font-black">免费体验版</h2>

            <p className="mt-5 leading-8 text-zinc-400">
              你当前可以免费体验 AI Bot Pro 的基础功能。后续开通 Pro 后，
              这里会显示真实会员套餐、到期时间、剩余次数和订单信息。
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mb-2 text-sm text-zinc-500">今日使用限制</div>
              <div className="text-3xl font-black">每日 5 次</div>
              <div className="mt-2 text-sm text-zinc-400">
                当前为免费体验限制，后续 Pro 版本可提高次数。
              </div>
            </div>

            <Link
              href="/chat"
              className="mt-8 inline-flex rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              立即使用
            </Link>
          </div>

          <div className="rounded-[2rem] border border-blue-400/30 bg-blue-500/10 p-8 backdrop-blur-xl md:p-10">
            <div className="mb-4 text-sm font-bold text-blue-300">
              PRO BENEFITS
            </div>

            <h2 className="text-4xl font-black">Pro 权益预览</h2>

            <p className="mt-5 leading-8 text-zinc-300">
              Pro 套餐即将开放，适合经常生成文案、标题、脚本、文章和办公内容的用户。
            </p>

            <div className="mt-8 space-y-4">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  <span className="text-zinc-200">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pricing"
              className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/10 px-8 py-4 font-black text-white transition hover:bg-white/20"
            >
              查看 Pro 套餐
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl md:p-12">
          <h2 className="text-4xl font-black md:text-5xl">
            登录和支付功能即将接入
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
            后续可以继续接入用户登录、数据库记录、支付回调、会员套餐、
            使用次数扣减和订单管理，让 AI Bot Pro 变成真正可运营的商业产品。
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              先免费体验
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

      <footer className="relative border-t border-white/10 px-6 py-8 text-center text-sm text-zinc-500">
        <div className="mb-4 flex flex-wrap justify-center gap-5">
          <Link href="/about" className="transition hover:text-white">
            关于我们
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
        </div>

        <div>© 2026 AI Bot Pro. All rights reserved.</div>
      </footer>
    </main>
  );
}