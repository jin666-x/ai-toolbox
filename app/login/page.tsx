import Link from "next/link";

export default function LoginPage() {
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

          <Link href="/login" className="text-white">
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

      <section className="relative mx-auto flex max-w-7xl items-center justify-center px-6 py-20">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
              ACCOUNT LOGIN
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              登录你的
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                AI 会员账号
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              当前为登录页面展示版。后续接入真实登录后，可以记录用户套餐、
              今日剩余次数、订单信息、使用记录和 Pro 会员权益。
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="text-2xl font-black">账号</div>
                <div className="mt-2 text-sm text-zinc-400">
                  后续支持邮箱登录
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="text-2xl font-black">套餐</div>
                <div className="mt-2 text-sm text-zinc-400">
                  自动识别会员状态
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="text-2xl font-black">次数</div>
                <div className="mt-2 text-sm text-zinc-400">
                  数据库记录用量
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/waitlist"
                className="rounded-2xl bg-white px-8 py-4 text-center font-black text-black transition hover:bg-zinc-200"
              >
                加入等待名单
              </Link>

              <Link
                href="/pricing"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center font-black text-white transition hover:bg-white/10"
              >
                查看套餐价格
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black">登录 AI Bot Pro</h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                展示版页面，暂未接入真实登录功能。
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  邮箱账号
                </label>

                <input
                  type="email"
                  placeholder="请输入邮箱"
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  登录密码
                </label>

                <input
                  type="password"
                  placeholder="请输入密码"
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <button
                disabled
                className="w-full cursor-not-allowed rounded-2xl bg-white/20 px-6 py-4 font-black text-zinc-400"
              >
                登录功能即将开放
              </button>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-200">
                当前页面只是商业版登录入口雏形。后续接入 Supabase、Clerk
                或自建用户系统后，就可以启用真实注册登录。
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-black text-white transition hover:bg-white/10"
              >
                先查看会员中心
              </Link>

              <Link
                href="/waitlist"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-black text-white transition hover:bg-white/10"
              >
                加入 Pro 等待名单
              </Link>

              <Link
                href="/chat"
                className="rounded-2xl bg-white px-6 py-4 text-center font-black text-black transition hover:bg-zinc-200"
              >
                不登录，直接免费体验
              </Link>
            </div>
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