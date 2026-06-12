import Link from "next/link";

const sections = [
  {
    title: "1. 我们收集的信息",
    desc: "当前 AI Bot Pro 主要用于 AI 工具体验。后续如果接入登录、会员、支付或反馈表单，可能会收集你的邮箱、账号信息、订单信息、使用记录和你主动提交的反馈内容。",
  },
  {
    title: "2. 信息的使用方式",
    desc: "我们会将相关信息用于提供 AI 工具服务、展示会员权益、统计使用次数、处理问题反馈、优化产品体验以及保障网站安全。",
  },
  {
    title: "3. AI 生成内容",
    desc: "你输入的内容会用于生成 AI 回复。请不要提交身份证号、银行卡号、密码、私密聊天记录等敏感信息。",
  },
  {
    title: "4. Cookie 和本地存储",
    desc: "当前网站可能会使用浏览器本地存储记录每日免费使用次数，用于限制免费体验次数和优化使用体验。",
  },
  {
    title: "5. 第三方服务",
    desc: "后续网站可能会接入 AI 模型接口、登录服务、支付服务、数据库服务或数据统计服务。我们会尽量选择可靠的第三方服务。",
  },
  {
    title: "6. 联系我们",
    desc: "如果你对隐私政策、数据使用或账号信息有疑问，可以通过联系我们页面进行反馈。",
  },
];

export default function PrivacyPage() {
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
          PRIVACY POLICY
        </div>

        <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
          隐私
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            政策
          </span>
        </h1>

        <p className="mt-8 text-lg leading-8 text-zinc-400">
          本隐私政策用于说明 AI Bot Pro 在提供 AI 工具箱服务过程中，可能如何收集、
          使用和保护相关信息。当前页面为网站展示版本，后续如果接入真实登录、支付、
          数据库和反馈系统，可以继续完善为正式法律版本。
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
            href="/terms"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
          >
            查看服务条款
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
            对隐私政策有疑问？
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
            如果你想了解数据使用方式、账号信息处理、反馈内容保存方式，
            可以通过联系我们页面进行反馈。
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              联系我们
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