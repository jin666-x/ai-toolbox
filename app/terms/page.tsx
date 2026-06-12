import Link from "next/link";

const sections = [
  {
    title: "1. 服务说明",
    desc: "AI Bot Pro 是一个 AI 效率工具箱，提供 AI 聊天、文案生成、标题生成、广告优化、短视频脚本、SEO文章、日报周报等功能。",
  },
  {
    title: "2. 使用限制",
    desc: "用户在使用 AI Bot Pro 时，不得提交违法、侵权、恶意攻击、垃圾信息、欺诈内容或其他不适合公开传播的内容。",
  },
  {
    title: "3. AI 生成内容",
    desc: "AI 生成内容仅供参考，用户应自行判断内容的准确性、合法性和适用性。涉及商业、法律、医疗、金融等重要场景时，请谨慎核实。",
  },
  {
    title: "4. 免费体验次数",
    desc: "当前免费版可能会限制每日使用次数。后续 Pro 套餐开放后，可能提供更高使用次数和更多高级功能。",
  },
  {
    title: "5. 账号和会员",
    desc: "当前登录和会员功能为展示版本。后续接入真实账号系统后，用户需要妥善保管账号信息，不得恶意刷量、攻击接口或滥用服务。",
  },
  {
    title: "6. 服务变更",
    desc: "AI Bot Pro 后续可能根据产品发展，对功能、套餐、价格、使用次数和服务内容进行调整。",
  },
  {
    title: "7. 联系我们",
    desc: "如果你对服务条款、产品使用、会员套餐或功能建议有疑问，可以通过联系我们页面进行反馈。",
  },
];

export default function TermsPage() {
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

      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 md:pt-24">
        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
          TERMS OF SERVICE
        </div>

        <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
          服务
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            条款
          </span>
        </h1>

        <p className="mt-8 text-lg leading-8 text-zinc-400">
          本服务条款用于说明用户使用 AI Bot Pro AI 工具箱时需要了解的基本规则。
          当前页面为网站展示版本，后续如果接入真实登录、支付、会员和订单系统，
          可以继续完善为正式法律版本。
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="rounded-2xl bg-white px-8 py-4 text-center text-lg font-black text-black transition hover:bg-zinc-200"
          >
            联系我们
          </Link>

          <Link
            href="/chat"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
          >
            免费体验工具箱
          </Link>

          <Link
            href="/privacy"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
          >
            查看隐私政策
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="space-y-5">
          {sections.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <h2 className="text-2xl font-black">{item.title}</h2>

              <p className="mt-5 leading-8 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 text-center backdrop-blur-xl md:p-14">
          <h2 className="text-4xl font-black md:text-5xl">
            对服务条款有疑问？
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
            如果你想了解 AI 工具使用规则、会员套餐、账号权限、内容生成限制
            或其他产品问题，可以通过联系我们页面进行反馈。
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              联系我们
            </Link>

            <Link
              href="/pricing"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
            >
              查看套餐价格
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