import Link from "next/link";

const values = [
  {
    title: "降低 AI 使用门槛",
    desc: "不用学习复杂提示词，用户只需要输入简单需求，就能快速生成内容。",
  },
  {
    title: "提升内容创作效率",
    desc: "覆盖文案、标题、广告、脚本、SEO文章、日报周报等高频场景。",
  },
  {
    title: "面向真实使用场景",
    desc: "适合自媒体、运营、销售、创业者、学生和办公用户日常使用。",
  },
];

export default function AboutPage() {
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

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
          ABOUT AI BOT PRO
        </div>

        <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
          关于
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            AI Bot Pro
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
          AI Bot Pro 是一个一站式 AI 效率工具箱，致力于把常用 AI 能力做成简单、
          直接、好用的工具。用户无需学习复杂提示词，也能快速生成文案、标题、
          广告词、短视频脚本、SEO文章、日报周报和更多实用内容。
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            免费体验工具箱
          </Link>

          <Link
            href="/contact"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
          >
            联系我们
          </Link>

          <Link
            href="/pricing"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
          >
            查看套餐价格
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <h2 className="text-3xl font-black">{item.title}</h2>

              <p className="mt-5 leading-8 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 text-sm font-bold text-blue-400">
                PRODUCT VISION
              </div>

              <h2 className="text-4xl font-black md:text-5xl">
                做一个普通人也能用好的 AI 工具箱
              </h2>

              <p className="mt-6 leading-8 text-zinc-400">
                很多 AI 产品功能很强，但普通用户不知道怎么提问，也不知道怎么把结果用到真实工作里。
                AI Bot Pro 希望把不同场景的专业提示词提前封装好，让用户点开工具、
                输入主题，就能拿到结构清晰、可以直接使用的结果。
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-3xl font-black">10+</div>
                <div className="mt-2 text-zinc-400">高频 AI 工具场景</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-3xl font-black">0 门槛</div>
                <div className="mt-2 text-zinc-400">不会提示词也能使用</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-3xl font-black">Pro</div>
                <div className="mt-2 text-zinc-400">
                  后续开放更多会员权益和高级功能
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 text-center backdrop-blur-xl md:p-16">
          <h2 className="text-4xl font-black md:text-5xl">
            有建议或合作需求？
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
            如果你想反馈问题、提出功能建议、咨询 Pro 套餐或了解合作方式，
            可以通过联系我们页面提交需求。
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              联系我们
            </Link>

            <Link
              href="/waitlist"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
            >
              加入等待名单
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