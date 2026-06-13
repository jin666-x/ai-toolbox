import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
    desc: "未登录用户每日可体验 5 次。注册并登录后，Free 免费版账号每日可使用 10 次。具体次数可能会根据产品调整。",
  },
  {
    title: "5. Pro 会员服务",
    desc: "Pro 会员当前默认每日可使用 100 次。现阶段 Pro 会员采用人工开通方式，后续可能接入在线支付、订单系统和更多会员权益。",
  },
  {
    title: "6. 账号和安全",
    desc: "用户需要妥善保管账号信息，不得恶意刷量、攻击接口、批量注册、滥用服务或影响其他用户正常使用。",
  },
  {
    title: "7. 服务变更",
    desc: "AI Bot Pro 后续可能根据产品发展，对功能、套餐、价格、使用次数和服务内容进行调整。",
  },
  {
    title: "8. 免责声明",
    desc: "因 AI 生成内容导致的决策、发布、商业使用或其他后果，需要用户自行判断和承担。我们建议用户在重要场景中进行人工核实。",
  },
  {
    title: "9. 联系我们",
    desc: "如果你对服务条款、产品使用、会员套餐或功能建议有疑问，可以通过联系我们页面进行反馈。",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_35%)]" />

      <SiteHeader />

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
          使用本站服务，即代表你理解并同意相关使用规则。后续如果接入在线支付、
          订单系统和更多会员权益，本条款可能会继续更新。
        </p>

        <div className="mt-6 rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5 text-sm leading-7 text-blue-100/80">
          提醒：AI 生成内容仅供参考。涉及法律、医疗、金融、合同、投资等重要场景时，
          请务必进行人工核实或咨询专业人士。
        </div>

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

      <SiteFooter />
    </main>
  );
}