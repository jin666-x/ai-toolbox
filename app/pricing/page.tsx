import Link from "next/link";

const plans = [
  {
    name: "Free 免费版",
    price: "￥0",
    unit: "/ 永久",
    desc: "适合新用户体验 AI 工具箱，登录后每日可使用 10 次。",
    features: [
      "登录账号每日 10 次",
      "未登录体验每日 5 次",
      "支持 AI 聊天助手",
      "支持爆款文案生成",
      "支持标题生成",
      "支持广告优化",
      "支持代码助手",
      "会员中心查看今日次数",
    ],
    button: "立即免费使用",
    href: "/chat",
    hot: false,
    status: "当前可用",
    note: "注册 / 登录后可获得每日 10 次使用额度。",
  },
  {
    name: "Pro 月卡",
    price: "￥19.9",
    unit: "/ 月",
    desc: "适合经常生成文案、标题、脚本、广告词的用户。",
    features: [
      "每日 100 次 AI 使用额度",
      "解锁全部 AI 工具",
      "适合短视频运营",
      "适合自媒体创作",
      "适合销售和广告投放",
      "优先体验新功能",
      "会员中心显示 Pro 状态",
      "人工开通会员权限",
    ],
    button: "申请开通 Pro",
    href: "/waitlist",
    hot: true,
    status: "人工开通",
    note: "当前支付功能暂未开放，可提交申请后由管理员开通。",
  },
  {
    name: "Pro 年卡",
    price: "￥199",
    unit: "/ 年",
    desc: "适合长期使用 AI 工具提升效率的个人、团队和创业者。",
    features: [
      "全年使用更划算",
      "每日 100 次 AI 使用额度",
      "优先体验新工具",
      "适合长期内容生产",
      "适合副业、自媒体、创业者",
      "后续可升级更多权益",
      "支持后台人工开通",
      "适合重度使用用户",
    ],
    button: "咨询年卡方案",
    href: "/contact",
    hot: false,
    status: "人工开通",
    note: "年卡适合长期用户，可先联系我们确认开通方式。",
  },
];

const faqs = [
  {
    q: "现在可以直接支付购买吗？",
    a: "当前支付功能还没有接入。Pro 会员可以先通过等待名单或联系页面提交申请，然后由管理员在后台手动开通。",
  },
  {
    q: "免费版每天可以用几次？",
    a: "未登录用户每日可体验 5 次。注册并登录后，Free 免费版账号每日可使用 10 次。",
  },
  {
    q: "Pro 会员每天可以用几次？",
    a: "当前 Pro 会员默认每日可使用 100 次，后续也可以根据套餐继续扩展更多次数。",
  },
  {
    q: "怎么知道自己是不是 Pro？",
    a: "登录后进入会员中心，可以看到当前套餐、今日已用次数和今日剩余次数。",
  },
];

export default function PricingPage() {
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

          <Link href="/pricing" className="text-white">
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

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/10 sm:inline-flex"
          >
            会员中心
          </Link>

          <Link
            href="/chat"
            className="rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            立即使用
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
          AI Bot Pro 套餐价格
        </div>

        <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
          选择适合你的
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            AI 套餐
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
          免费版适合体验，Pro 版适合高频创作、文案生成、短视频脚本、广告优化和办公效率提升。
          当前 Pro 会员支持后台人工开通，支付功能后续接入。
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            免费开始使用
          </Link>

          <Link
            href="/waitlist"
            className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 text-lg font-black text-purple-100 transition hover:bg-purple-500/30"
          >
            申请 Pro 会员
          </Link>

          <Link
            href="/contact"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
          >
            联系我们
          </Link>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-[2rem] border p-8 backdrop-blur-xl transition hover:-translate-y-1 ${
              plan.hot
                ? "border-purple-400/50 bg-purple-500/10 shadow-2xl shadow-purple-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="absolute right-6 top-6 flex flex-col items-end gap-2">
              {plan.hot && (
                <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                  推荐
                </div>
              )}

              <div
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  plan.status === "当前可用"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                }`}
              >
                {plan.status}
              </div>
            </div>

            <h2 className="pr-24 text-3xl font-black">{plan.name}</h2>

            <p className="mt-4 min-h-14 leading-7 text-zinc-400">
              {plan.desc}
            </p>

            <div className="mt-8 flex items-end gap-2">
              <div className="text-5xl font-black">{plan.price}</div>
              <div className="pb-2 text-zinc-500">{plan.unit}</div>
            </div>

            <Link
              href={plan.href}
              className={`mt-8 flex w-full items-center justify-center rounded-2xl px-6 py-4 font-black transition ${
                plan.hot
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {plan.button}
            </Link>

            <p className="mt-3 min-h-10 text-center text-xs leading-5 text-zinc-500">
              {plan.note}
            </p>

            <div className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      plan.hot ? "bg-purple-300" : "bg-emerald-400"
                    }`}
                  />
                  <span className="text-left text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 text-sm font-bold text-purple-300">
                PRO MEMBERSHIP
              </div>

              <h2 className="text-4xl font-black md:text-5xl">
                Pro 会员已支持，
                <br />
                可人工开通权限
              </h2>

              <p className="mt-6 leading-8 text-zinc-400">
                当前系统已经支持登录账号、会员中心、每日使用次数、Free / Pro
                套餐识别和后台开通会员。支付功能后续接入前，可以先通过等待名单或联系页面提交申请。
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/waitlist"
                  className="inline-flex rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
                >
                  申请 Pro
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
                >
                  联系我们
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-3xl font-black">5 次/天</div>
                <div className="mt-2 text-zinc-400">未登录用户每日体验次数</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-3xl font-black">10 次/天</div>
                <div className="mt-2 text-zinc-400">Free 免费账号每日次数</div>
              </div>

              <div className="rounded-3xl border border-purple-300/20 bg-purple-500/10 p-6">
                <div className="text-3xl font-black text-purple-100">
                  100 次/天
                </div>
                <div className="mt-2 text-purple-100/70">
                  Pro 会员账号每日次数
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black">常见问题</h2>
          <p className="mt-4 text-zinc-400">
            关于套餐、使用次数和 Pro 开通方式，你可能想知道这些。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <h3 className="text-xl font-black">{item.q}</h3>
              <p className="mt-4 leading-7 text-zinc-400">{item.a}</p>
            </div>
          ))}
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