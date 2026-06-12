import Link from "next/link";

const contactCards = [
  {
    title: "产品咨询",
    desc: "了解 AI Bot Pro 工具箱、套餐价格、Pro 权益和后续功能。",
  },
  {
    title: "问题反馈",
    desc: "如果页面异常、生成失败、次数显示异常，可以通过这里反馈。",
  },
  {
    title: "商务合作",
    desc: "后续可用于承接定制 AI 工具、企业方案、流量合作等需求。",
  },
];

export default function ContactPage() {
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

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
              CONTACT US
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              联系
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                AI Bot Pro
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              如果你想了解 Pro 套餐、反馈使用问题、咨询合作或提出功能建议，
              后续都可以通过这个页面联系。当前为展示版页面，暂未接入真实表单提交。
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="rounded-2xl bg-white px-8 py-4 text-center text-lg font-black text-black transition hover:bg-zinc-200"
              >
                先免费体验
              </Link>

              <Link
                href="/waitlist"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
              >
                加入等待名单
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-black">提交反馈</h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                当前是展示版表单，后续可接入邮箱、数据库或飞书通知。
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  你的邮箱
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
                  反馈类型
                </label>

                <select
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-zinc-500 outline-none"
                >
                  <option>请选择反馈类型</option>
                  <option>产品咨询</option>
                  <option>问题反馈</option>
                  <option>商务合作</option>
                  <option>功能建议</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  具体内容
                </label>

                <textarea
                  disabled
                  placeholder="请输入你想反馈的内容"
                  className="h-32 w-full cursor-not-allowed resize-none rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <button
                disabled
                className="w-full cursor-not-allowed rounded-2xl bg-white/20 px-6 py-4 font-black text-zinc-400"
              >
                提交功能即将开放
              </button>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-200">
                这个页面现在用于完善网站结构。后续接入真实提交后，
                可以自动收集用户邮箱、反馈内容和合作需求。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            你可以联系我们做什么？
          </h2>

          <p className="mt-5 text-zinc-400">
            不管是产品问题、功能建议，还是后续商业合作，都可以放到这个入口。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {contactCards.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <h3 className="text-3xl font-black">{item.title}</h3>
              <p className="mt-5 leading-8 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 text-center backdrop-blur-xl md:p-16">
          <h2 className="text-4xl font-black md:text-5xl">
            先体验，再决定是否升级
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
            你可以先免费体验 AI 聊天、爆款文案、标题生成、广告优化、
            短视频脚本、SEO文章和日报周报等功能。
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
            >
              免费体验工具箱
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