import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const tools = [
  {
    id: "chat",
    name: "AI 聊天助手",
    desc: "日常问答、方案整理、内容创作，帮你快速解决问题。",
    tag: "通用问答",
  },
  {
    id: "copy",
    name: "爆款文案",
    desc: "输入产品或主题，自动生成抖音、小红书、朋友圈文案。",
    tag: "内容创作",
  },
  {
    id: "title",
    name: "标题生成",
    desc: "快速生成吸睛标题，适合短视频、广告、公众号。",
    tag: "流量标题",
  },
  {
    id: "ad",
    name: "广告优化",
    desc: "把普通广告词优化成更有点击欲望的转化文案。",
    tag: "提升转化",
  },
  {
    id: "code",
    name: "代码助手",
    desc: "解释报错、修改页面、辅助开发，小白也能看懂。",
    tag: "开发辅助",
  },
  {
    id: "script",
    name: "短视频脚本",
    desc: "自动生成短视频标题、口播脚本和结尾引导。",
    tag: "视频创作",
  },
  {
    id: "moments",
    name: "朋友圈文案",
    desc: "生成适合朋友圈、社群、私域转化的自然文案。",
    tag: "私域运营",
  },
  {
    id: "seo",
    name: "SEO文章",
    desc: "生成适合网站、公众号、博客发布的结构化文章。",
    tag: "搜索优化",
  },
  {
    id: "report",
    name: "日报周报",
    desc: "把零散工作内容整理成正式日报、周报和项目总结。",
    tag: "办公效率",
  },
  {
    id: "rewrite",
    name: "翻译润色",
    desc: "帮你润色、改写、翻译，让表达更自然更专业。",
    tag: "文本优化",
  },
];

const steps = [
  {
    title: "选择工具",
    desc: "聊天、文案、标题、广告、脚本、SEO、日报等工具一站集成。",
  },
  {
    title: "输入需求",
    desc: "不用会提示词，只需要输入主题、产品、问题或工作内容。",
  },
  {
    title: "生成结果",
    desc: "AI 自动按对应工具格式输出，可直接复制、修改和发布。",
  },
];

const planCards = [
  {
    name: "未登录体验",
    limit: "5 次/天",
    desc: "适合快速体验 AI 工具箱基础能力。",
  },
  {
    name: "Free 免费版",
    limit: "10 次/天",
    desc: "注册登录后自动获得每日 10 次额度。",
  },
  {
    name: "Pro 会员版",
    limit: "100 次/天",
    desc: "适合高频创作、短视频运营、广告文案和办公提效。",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

      <SiteHeader />

      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="mb-6 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
          一站式 AI 效率工具箱
        </div>

        <h1 className="max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
          一个网站，
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            搞定你的 AI 创作需求
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
          AI Bot Pro 集成文案生成、标题创作、广告优化、短视频脚本、SEO
          文章、日报周报、代码辅助等常用工具。不需要会写提示词，输入简单需求，
          AI 自动帮你生成可直接使用的结果。
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            进入 AI 工具箱
          </Link>

          <Link
            href="/pricing"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
          >
            查看套餐价格
          </Link>

          <Link
            href="/waitlist"
            className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 text-lg font-bold text-purple-100 transition hover:bg-purple-500/30"
          >
            申请 Pro 会员
          </Link>
        </div>

        <div className="mt-12 grid w-full max-w-5xl gap-4 text-left md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-3xl font-black">10+</div>
            <div className="mt-2 text-zinc-400">常用 AI 工具</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-3xl font-black">5 次</div>
            <div className="mt-2 text-zinc-400">未登录免费体验</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-3xl font-black">10 次</div>
            <div className="mt-2 text-zinc-400">Free 账号每日额度</div>
          </div>

          <div className="rounded-3xl border border-purple-300/20 bg-purple-500/10 p-6 backdrop-blur-xl">
            <div className="text-3xl font-black text-purple-100">100 次</div>
            <div className="mt-2 text-purple-100/70">Pro 会员每日额度</div>
          </div>
        </div>
      </section>

      <section id="tools" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="mb-4 text-sm font-bold text-blue-400">AI TOOLS</div>

          <h2 className="text-4xl font-black md:text-5xl">
            常用 AI 工具，一站集成
          </h2>

          <p className="mt-5 text-zinc-400">
            不用到处找工具，一个页面就能完成大部分创作、办公和运营需求。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={`/chat?tool=${tool.id}`}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-blue-300">
                {tool.tag}
              </div>

              <h3 className="text-2xl font-black">{tool.name}</h3>

              <p className="mt-4 leading-7 text-zinc-400">{tool.desc}</p>

              <div className="mt-6 text-sm font-bold text-white group-hover:text-blue-300">
                立即使用 →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="plans" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="mb-4 text-sm font-bold text-purple-300">
            USAGE LIMIT
          </div>

          <h2 className="text-4xl font-black md:text-5xl">
            从免费体验到 Pro 高频使用
          </h2>

          <p className="mt-5 text-zinc-400">
            先免费体验，登录后获得更多额度，需要高频使用可申请 Pro 会员。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {planCards.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[2rem] border p-8 backdrop-blur-xl ${
                plan.name.includes("Pro")
                  ? "border-purple-300/30 bg-purple-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="text-xl font-black">{plan.name}</div>

              <div
                className={`mt-5 text-5xl font-black ${
                  plan.name.includes("Pro") ? "text-purple-100" : "text-white"
                }`}
              >
                {plan.limit}
              </div>

              <p className="mt-5 leading-7 text-zinc-400">{plan.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
          >
            查看套餐价格
          </Link>

          <Link
            href="/waitlist"
            className="inline-flex rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 font-black text-purple-100 transition hover:bg-purple-500/30"
          >
            申请 Pro 会员
          </Link>
        </div>
      </section>

      <section id="steps" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 text-sm font-bold text-purple-400">
                SIMPLE WORKFLOW
              </div>

              <h2 className="text-4xl font-black md:text-5xl">
                不用学习提示词，
                <br />
                直接输入需求
              </h2>

              <p className="mt-6 leading-8 text-zinc-400">
                很多 AI 工具不好用，是因为用户不知道该怎么问。
                AI Bot Pro 已经帮你把不同工具的专业提示词提前写好，
                你只需要输入主题，系统会自动套用对应模板。
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-3xl border border-white/10 bg-black/30 p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-black">
                    {index + 1}
                  </div>

                  <div>
                    <div className="text-lg font-black">{step.title}</div>
                    <p className="mt-1 leading-7 text-zinc-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 text-center backdrop-blur-xl md:p-16">
          <h2 className="text-4xl font-black md:text-6xl">
            现在就开始使用 AI Bot Pro
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            输入一个关键词，AI 自动生成文案、标题、广告词、短视频脚本、
            SEO 文章和工作汇报。适合自媒体、运营、销售、创业者和办公用户。
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="inline-flex rounded-2xl bg-white px-10 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
            >
              进入 AI 工具箱
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-lg font-black text-white transition hover:bg-white/10"
            >
              查看会员中心
            </Link>

            <Link
              href="/waitlist"
              className="inline-flex rounded-2xl border border-purple-300/30 bg-purple-500/20 px-10 py-4 text-lg font-black text-purple-100 transition hover:bg-purple-500/30"
            >
              申请 Pro
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
            申请 Pro
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