import Link from "next/link";

export default function TermsPage() {
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
          <div className="mb-4 text-sm font-bold text-pink-400">
            TERMS OF SERVICE
          </div>

          <h1 className="text-4xl font-black md:text-5xl">服务条款</h1>

          <p className="mt-4 text-sm text-zinc-500">
            最后更新日期：2026 年 6 月
          </p>

          <div className="mt-8 space-y-8 leading-8 text-zinc-300">
            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                1. 服务说明
              </h2>
              <p>
                AI Bot Pro 是一个 AI 效率工具箱，为用户提供 AI 聊天、文案生成、
                标题生成、广告优化、短视频脚本、SEO文章、日报周报、代码辅助等功能。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                2. 使用规则
              </h2>
              <p>
                用户在使用本服务时，应遵守相关法律法规，不得利用本服务生成、
                发布或传播违法、侵权、欺诈、骚扰、恶意攻击或其他不当内容。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                3. AI 生成内容说明
              </h2>
              <p>
                AI 生成内容可能存在不准确、不完整或不适合直接使用的情况。
                用户应自行判断、核实和修改生成结果，不应将 AI 回复作为唯一决策依据。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                4. 用户输入内容
              </h2>
              <p>
                用户应对自己输入的内容负责。请不要提交账号密码、身份证号、银行卡号、
                商业机密或其他敏感信息。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                5. 免费与付费服务
              </h2>
              <p>
                当前网站可能提供免费体验次数。后续如开放付费套餐，具体功能、价格、
                使用次数和权益以页面展示为准。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                6. 服务变更
              </h2>
              <p>
                我们可能会根据产品规划、技术升级或运营需要，对网站功能、页面内容、
                使用规则进行调整。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                7. 免责声明
              </h2>
              <p>
                本服务提供的 AI 生成内容仅供参考。因用户使用生成内容产生的风险、
                损失或纠纷，由用户自行承担相应责任。
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-200"
            >
              返回首页
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}