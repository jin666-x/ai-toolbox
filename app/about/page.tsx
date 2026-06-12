import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]" />

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black">
            AI Bot Pro
          </Link>

          <Link
            href="/chat"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            免费体验
          </Link>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-12">
          <div className="mb-4 text-sm font-bold text-blue-400">
            ABOUT US
          </div>

          <h1 className="text-4xl font-black md:text-5xl">关于我们</h1>

          <div className="mt-8 space-y-6 leading-8 text-zinc-300">
            <p>
              AI Bot Pro 是一个一站式 AI 效率工具箱，致力于帮助用户更简单地使用
              AI 完成内容创作、办公写作、运营推广和日常问题处理。
            </p>

            <p>
              我们希望让 AI 工具变得更容易使用。用户不需要学习复杂的提示词，
              只需要选择对应工具，输入简单需求，系统就可以自动生成更结构化、
              更容易直接使用的内容。
            </p>

            <p>
              目前 AI Bot Pro 支持 AI 聊天、爆款文案、标题生成、广告优化、
              短视频脚本、朋友圈文案、SEO 文章、日报周报、代码助手和文本润色等功能。
            </p>

            <p>
              未来我们会继续优化更多实用工具，提升生成质量、使用体验和创作效率，
              让 AI 真正成为每个人都能轻松使用的效率助手。
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="rounded-2xl bg-white px-6 py-3 text-center font-black text-black transition hover:bg-zinc-200"
            >
              开始使用
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center font-black text-white transition hover:bg-white/10"
            >
              返回首页
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}