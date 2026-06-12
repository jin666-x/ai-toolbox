import Link from "next/link";

const tools = [
  {
    name: "AI 聊天助手",
    desc: "日常问答、方案整理、内容创作，一站式解决。",
  },
  {
    name: "爆款文案",
    desc: "快速生成抖音、小红书、朋友圈高吸引力文案。",
  },
  {
    name: "标题生成",
    desc: "生成有点击欲望、有冲突感、有传播力的标题。",
  },
  {
    name: "广告优化",
    desc: "把普通广告词优化成更有转化力的营销表达。",
  },
  {
    name: "代码助手",
    desc: "解释报错、修改页面、辅助开发，新手也能看懂。",
  },
  {
    name: "更多工具",
    desc: "后续可扩展图片提示词、简历优化、翻译、方案生成等。",
  },
];

const stats = [
  {
    value: "5+",
    label: "AI 工具模块",
  },
  {
    value: "24h",
    label: "随时在线使用",
  },
  {
    value: "1站式",
    label: "内容创作平台",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-6">
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
          <div className="text-2xl font-black tracking-tight">
            AI Bot Pro
          </div>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <span>首页</span>
            <span>工具箱</span>
            <span>创作助手</span>
            <span>关于我们</span>
          </nav>

          <Link
            href="/chat"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            立即使用
          </Link>
        </header>

        <section className="grid min-h-[720px] items-center gap-10 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-300">
              AI 智能创作平台
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              一站式 AI 工具箱
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              AI Bot Pro 帮你快速完成聊天问答、爆款文案、标题生成、广告优化、代码辅助等内容创作任务，让想法更快变成结果。
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="rounded-2xl bg-white px-8 py-4 text-center font-bold text-black transition hover:bg-zinc-200"
              >
                开始使用 AI 工具箱
              </Link>

              <a
                href="#tools"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center font-bold text-white transition hover:bg-white/10"
              >
                查看工具
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <div className="text-3xl font-black">{item.value}</div>
                  <div className="mt-2 text-sm text-zinc-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/60 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-zinc-500">AI Bot Pro</div>
                    <div className="mt-1 text-2xl font-black">智能创作台</div>
                  </div>

                  <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-400">
                    在线运行
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-2 text-sm text-zinc-500">输入需求</div>
                    <div className="text-zinc-200">
                      帮我写一条 AI 工具箱的抖音爆款文案
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-3 text-sm text-zinc-500">AI 回复</div>
                    <div className="space-y-3 text-zinc-300">
                      <p>🔥 普通人也能用的 AI 创作神器来了。</p>
                      <p>
                        写文案、想标题、改广告、看代码，一个工具箱全搞定。
                      </p>
                      <p>
                        不用会技术，输入一句话，AI 直接帮你生成结果。
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm text-zinc-500">生成速度</div>
                      <div className="mt-2 text-2xl font-black">快速</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm text-zinc-500">使用门槛</div>
                      <div className="mt-2 text-2xl font-black">简单</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="pb-24">
          <div className="mb-10">
            <div className="mb-3 text-sm text-zinc-500">TOOLS</div>
            <h2 className="text-4xl font-black tracking-tight">
              常用 AI 工具
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-400">
              从内容创作到代码辅助，把高频需求集中到一个平台里。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href="/chat"
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-black">
                  AI
                </div>

                <h3 className="text-xl font-black">{tool.name}</h3>
                <p className="mt-3 leading-7 text-zinc-400">{tool.desc}</p>

                <div className="mt-6 text-sm font-bold text-zinc-300 group-hover:text-white">
                  立即体验 →
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
          <h2 className="text-4xl font-black tracking-tight">
            现在开始使用 AI Bot Pro
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
            一个网站，集成多个 AI 创作工具，适合做内容、做营销、做项目、做副业。
          </p>

          <Link
            href="/chat"
            className="mt-8 inline-flex rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
          >
            进入工具箱
          </Link>
        </section>
      </div>
    </main>
  );
}