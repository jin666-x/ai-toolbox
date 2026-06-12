import Link from "next/link";

export default function PrivacyPage() {
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
          <div className="mb-4 text-sm font-bold text-purple-400">
            PRIVACY POLICY
          </div>

          <h1 className="text-4xl font-black md:text-5xl">隐私政策</h1>

          <p className="mt-4 text-sm text-zinc-500">
            最后更新日期：2026 年 6 月
          </p>

          <div className="mt-8 space-y-8 leading-8 text-zinc-300">
            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                1. 我们收集的信息
              </h2>
              <p>
                当你使用 AI Bot Pro 时，我们可能会处理你主动输入的文本内容，
                例如问题、文案需求、标题主题、代码片段或其他用于生成 AI 回复的信息。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                2. 信息的使用方式
              </h2>
              <p>
                我们使用这些信息是为了向你提供 AI 内容生成、文本优化、问题解答、
                工具体验优化等服务。我们不会要求你输入与使用本服务无关的敏感信息。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                3. 本地使用次数记录
              </h2>
              <p>
                免费体验次数可能会通过浏览器本地存储记录，用于判断当天剩余免费使用次数。
                该记录主要保存在你的浏览器中，用于基础体验限制。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                4. 第三方服务
              </h2>
              <p>
                AI Bot Pro 可能会调用第三方 AI 接口来生成回复内容。你输入的内容可能会被发送至相关
                AI 服务用于生成结果。请不要输入身份证号、银行卡号、账号密码等敏感信息。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                5. 数据安全
              </h2>
              <p>
                我们会尽力采取合理措施保护用户信息安全，但互联网环境无法保证绝对安全。
                使用本服务时，请避免提交重要隐私、商业机密或敏感账号信息。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                6. 政策更新
              </h2>
              <p>
                我们可能会根据产品功能变化对隐私政策进行调整。更新后的内容会在本页面展示。
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-black text-white">
                7. 联系我们
              </h2>
              <p>
                如果你对本隐私政策有任何疑问，可以通过网站后续提供的联系方式与我们联系。
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