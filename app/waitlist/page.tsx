import Link from "next/link";

const reasons = [
  {
    title: "更高使用次数",
    desc: "Pro 版本后续会提供更高每日生成次数，适合长期使用。",
  },
  {
    title: "更多专业工具",
    desc: "后续会增加更多适合短视频、营销、办公和开发的 AI 工具。",
  },
  {
    title: "更长内容生成",
    desc: "支持更长文章、更复杂脚本、更完整方案的生成。",
  },
  {
    title: "优先体验新功能",
    desc: "等待名单用户后续可优先体验会员、支付、订单和更多新功能。",
  },
];

export default function WaitlistPage() {
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

          <Link href="/waitlist" className="text-white">
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

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/10 sm:inline-flex"
          >
            联系我们
          </Link>

          <Link
            href="/chat"
            className="rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            免费体验
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
              PRO WAITLIST
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              加入 Pro
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                等待名单
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              AI Bot Pro Pro 套餐即将开放。加入等待名单后，后续可以优先体验
              更高次数、更长内容生成、会员中心、订单系统和更多高级 AI 工具。
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="rounded-2xl bg-white px-8 py-4 text-center text-lg font-black text-black transition hover:bg-zinc-200"
              >
                先免费体验
              </Link>

              <Link
                href="/pricing"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
              >
                查看套餐
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
              >
                联系我们
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-black">等待名单登记</h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                当前是展示版表单，暂未接入数据库。后续接入后可收集邮箱和用户需求。
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  邮箱地址
                </label>

                <input
                  type="email"
                  disabled
                  placeholder="请输入你的邮箱"
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  你最想使用的功能
                </label>

                <select
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-zinc-500 outline-none"
                >
                  <option>请选择功能方向</option>
                  <option>更多 AI 工具</option>
                  <option>更高使用次数</option>
                  <option>更长内容生成</option>
                  <option>会员支付功能</option>
                </select>
              </div>

              <button
                disabled
                className="w-full cursor-not-allowed rounded-2xl bg-white/20 px-6 py-4 font-black text-zinc-400"
              >
                等待名单功能即将开放
              </button>

              <Link
                href="/contact"
                className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-black text-white transition hover:bg-white/10"
              >
                先联系我们咨询
              </Link>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-200">
                目前该页面用于展示商业闭环。后续接入 Supabase 或数据库后，
                就可以真正收集等待名单用户。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            Pro 版本适合谁？
          </h2>

          <p className="mt-5 text-zinc-400">
            经常需要生成内容、运营账号、写方案、做营销的人，更适合升级 Pro。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <h3 className="text-2xl font-black">{item.title}</h3>
              <p className="mt-4 leading-7 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 text-center backdrop-blur-xl md:p-16">
          <h2 className="text-4xl font-black md:text-5xl">
            现在先免费体验，后续再升级
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
            你可以先体验 AI 聊天、爆款文案、标题生成、广告优化、短视频脚本、
            SEO文章和日报周报等功能。Pro 开放后再升级更多权益。
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              免费体验工具箱
            </Link>

            <Link
              href="/contact"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
            >
              联系我们
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
            >
              查看会员中心
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