import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_35%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16 md:px-8 lg:px-10">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-10">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-300/30 bg-emerald-500/15 text-3xl">
              ✓
            </div>

            <div className="mb-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-100">
              提交成功
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              付款确认已提交
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                请等待管理员审核开通
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              你的付款确认信息已经提交到后台。管理员确认付款后，会为你的账号开通 Pro 权限。
              开通后你可以在会员中心查看套餐状态和到期时间。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 inline-flex rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                  第 1 步
                </div>
                <h2 className="text-lg font-black">后台收到记录</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  你的套餐、邮箱、付款方式和付款凭证已经提交。
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 inline-flex rounded-full border border-purple-300/20 bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-100">
                  第 2 步
                </div>
                <h2 className="text-lg font-black">管理员审核</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  管理员会核对付款凭证，并为对应账号开通 Pro。
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 inline-flex rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-100">
                  第 3 步
                </div>
                <h2 className="text-lg font-black">查看会员状态</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  开通完成后，可在会员中心查看 Pro 状态和使用额度。
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-yellow-300/20 bg-yellow-500/10 p-5">
              <h2 className="text-lg font-black text-yellow-100">
                温馨提示
              </h2>
              <p className="mt-2 text-sm leading-7 text-yellow-100/75">
                如果长时间未开通，请确认你填写的邮箱是否是登录邮箱；如果付款凭证填写的是“已发客服微信”，请确保客服能看到对应截图。
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-200"
              >
                去会员中心
              </Link>

              <Link
                href="/chat"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white transition hover:bg-white/10"
              >
                继续使用 AI 工具
              </Link>

              <Link
                href="/checkout"
                className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-6 py-3 font-black text-emerald-100 transition hover:bg-emerald-500/20"
              >
                重新提交付款确认
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-black/30 px-6 py-3 font-black text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}