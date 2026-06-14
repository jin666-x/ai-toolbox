"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type PublicSettings = {
  customer_wechat?: string;
  payment_notice?: string;
  monthly_price?: string;
  yearly_price?: string;
  review_notice?: string;
  site_announcement?: string;
};

type PublicSettingsResponse = {
  success?: boolean;
  settings?: PublicSettings;
};

const defaultSettings: Required<PublicSettings> = {
  customer_wechat: "请填写客服微信",
  payment_notice: "付款后请提交付款截图或填写已发客服微信。",
  monthly_price: "¥19.9",
  yearly_price: "¥199",
  review_notice: "管理员确认付款后会为账号开通 Pro 权限。",
  site_announcement: "AI Bot Pro 正在持续升级中。",
};

const tools = [
  {
    id: "chat",
    name: "AI 聊天助手",
    desc: "把问题、思路、资料交给 AI，快速整理成清晰答案。",
    tag: "问答整理",
  },
  {
    id: "copy",
    name: "爆款文案",
    desc: "生成短视频、小红书、朋友圈、私域成交文案。",
    tag: "内容创作",
  },
  {
    id: "title",
    name: "标题生成",
    desc: "为视频、文章、广告快速生成更有点击欲望的标题。",
    tag: "流量标题",
  },
  {
    id: "ad",
    name: "广告优化",
    desc: "把普通广告词改成更清楚、更有转化力的表达。",
    tag: "提升转化",
  },
  {
    id: "code",
    name: "代码助手",
    desc: "解释报错、辅助改页面、整理代码思路，小白也能看懂。",
    tag: "开发辅助",
  },
  {
    id: "script",
    name: "短视频脚本",
    desc: "生成口播脚本、开头钩子、结尾引导和分镜思路。",
    tag: "视频创作",
  },
  {
    id: "moments",
    name: "朋友圈文案",
    desc: "生成自然不生硬的朋友圈、社群、私域发布内容。",
    tag: "私域运营",
  },
  {
    id: "seo",
    name: "SEO 文章",
    desc: "生成结构清晰、适合网站和公众号发布的文章草稿。",
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
    desc: "改写、润色、翻译，让表达更自然、更专业。",
    tag: "文本优化",
  },
];

const audiences = [
  {
    title: "自媒体创作者",
    desc: "快速生成标题、脚本、口播、文案，减少卡壳时间。",
  },
  {
    title: "运营和销售",
    desc: "优化活动文案、朋友圈内容、广告语和私域转化话术。",
  },
  {
    title: "学生和办公用户",
    desc: "整理资料、写总结、做日报周报、润色表达更省时间。",
  },
  {
    title: "创业者和小团队",
    desc: "用一个工具箱覆盖内容、运营、客服、方案和效率需求。",
  },
];

const steps = [
  {
    title: "选一个工具",
    desc: "聊天、文案、标题、广告、脚本、SEO、日报等场景都已分类。",
  },
  {
    title: "输入简单需求",
    desc: "不需要会提示词，只要写清楚主题、产品、问题或工作内容。",
  },
  {
    title: "复制结果使用",
    desc: "生成内容可直接复制，也可以继续让 AI 帮你改短、改高级、改成交。",
  },
];

const faqs = [
  {
    q: "不会写提示词可以用吗？",
    a: "可以。工具箱已经按场景做了分类，你只需要输入主题或需求，系统会按对应工具生成结果。",
  },
  {
    q: "Free 和 Pro 有什么区别？",
    a: "未登录可体验 5 次，登录后 Free 每日 10 次，Pro 每日 100 次，更适合高频创作、运营和办公。",
  },
  {
    q: "付款后多久开通？",
    a: "提交付款截图后由管理员人工审核，审核通过后会开通 Pro，并通过邮件通知你。",
  },
  {
    q: "适合什么人使用？",
    a: "适合自媒体、运营、销售、办公用户、学生、创业者和小团队，用来提升内容创作和日常工作效率。",
  },
];

export default function HomePage() {
  const [settings, setSettings] =
    useState<Required<PublicSettings>>(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = (await res.json()) as PublicSettingsResponse;

        if (data.settings) {
          setSettings({
            ...defaultSettings,
            ...data.settings,
          });
        }
      } catch (error) {
        console.error("读取首页配置失败：", error);
      } finally {
        setLoadingSettings(false);
      }
    }

    loadSettings();
  }, []);

  const planCards = useMemo(
    () => [
      {
        name: "未登录体验",
        price: "免费",
        unit: "",
        limit: "5 次/天",
        desc: "不用注册也能先试试看，适合快速感受工具效果。",
        button: "立即体验",
        href: "/chat",
        hot: false,
        status: "体验版",
        features: ["无需登录", "每日 5 次", "适合快速试用"],
      },
      {
        name: "Free 免费版",
        price: "￥0",
        unit: "/ 永久",
        limit: "10 次/天",
        desc: "注册登录后自动获得每日额度，适合轻度使用。",
        button: "免费使用",
        href: "/chat",
        hot: false,
        status: "当前可用",
        features: ["登录账号", "每日 10 次", "会员中心查看额度"],
      },
      {
        name: "Pro 月卡",
        price: settings.monthly_price,
        unit: "/ 月",
        limit: "100 次/天",
        desc: "适合每天都要写文案、做运营、改标题和处理工作的用户。",
        button: "开通 Pro",
        href: "/checkout",
        hot: true,
        status: "推荐",
        features: ["每日 100 次", "适合高频使用", "付款截图审核", "开通邮件通知"],
      },
      {
        name: "Pro 年卡",
        price: settings.yearly_price,
        unit: "/ 年",
        limit: "100 次/天",
        desc: "适合长期使用，比月卡更省心，适合个人和小团队长期提效。",
        button: "开通年卡",
        href: "/checkout",
        hot: false,
        status: "更划算",
        features: ["全年使用", "每日 100 次", "可续费", "适合长期用户"],
      },
    ],
    [settings.monthly_price, settings.yearly_price]
  );

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

      <SiteHeader />

      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-16 pt-16 text-center md:pb-24 md:pt-24">
        <div className="mb-6 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-zinc-300 backdrop-blur-xl">
          写文案 · 做标题 · 改广告 · 出脚本 · 整理工作
        </div>

        <h1 className="max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
          把零散需求，
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            变成可直接用的结果
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
          AI Bot Pro 是一个一站式 AI 效率工具箱。你不用研究复杂提示词，
          只需要输入主题、产品、问题或工作内容，就能生成文案、标题、脚本、
          文章、总结和代码思路。
        </p>

        {settings.site_announcement ? (
          <div className="mt-8 max-w-3xl rounded-3xl border border-blue-300/20 bg-blue-500/10 p-5 text-left backdrop-blur-xl">
            <div className="mb-2 text-sm font-black text-blue-100">
              网站公告
            </div>
            <p className="text-sm leading-7 text-blue-100/75">
              {loadingSettings ? "正在读取最新公告..." : settings.site_announcement}
            </p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            先免费使用
          </Link>

          <Link
            href="/checkout"
            className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 text-lg font-black text-purple-100 transition hover:bg-purple-500/30"
          >
            开通 Pro
          </Link>

          <Link
            href="/pricing"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
          >
            查看价格
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-8 py-4 text-lg font-bold text-emerald-100 transition hover:bg-emerald-500/20"
          >
            会员中心
          </Link>
        </div>

        <p className="mt-5 text-sm text-zinc-500">
          未登录可体验 5 次，登录后每日 10 次，Pro 每日 100 次。
        </p>

        <div className="mt-12 grid w-full max-w-6xl gap-4 text-left md:grid-cols-5">
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

          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-6 backdrop-blur-xl">
            <div className="text-3xl font-black text-emerald-100">
              {settings.monthly_price}
            </div>
            <div className="mt-2 text-emerald-100/70">Pro 月卡起</div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mb-4 text-sm font-bold text-emerald-300">
            WHO IS IT FOR
          </div>

          <h2 className="text-4xl font-black md:text-5xl">
            适合需要快速产出内容和方案的人
          </h2>

          <p className="mt-5 text-zinc-400">
            不是让你学习一堆复杂工具，而是把常用场景整理成一个能直接使用的入口。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="mb-5 h-2 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
              <h3 className="text-2xl font-black">{item.title}</h3>
              <p className="mt-4 leading-7 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tools" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="mb-4 text-sm font-bold text-blue-400">AI TOOLS</div>

          <h2 className="text-4xl font-black md:text-5xl">
            常用工具，一站集成
          </h2>

          <p className="mt-5 text-zinc-400">
            文案、标题、广告、脚本、SEO、日报、代码辅助，不用来回切换多个工具。
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
            PRICING
          </div>

          <h2 className="text-4xl font-black md:text-5xl">
            先免费试用，再按需求升级
          </h2>

          <p className="mt-5 text-zinc-400">
            轻度使用可以用 Free，高频内容创作和办公提效建议开通 Pro。
          </p>

          <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-purple-300/20 bg-purple-500/10 p-5 text-sm leading-7 text-purple-100/75">
            当前 Pro 月卡：<span className="font-black text-white">{settings.monthly_price}</span>
            ，Pro 年卡：<span className="font-black text-white">{settings.yearly_price}</span>。
            付款后上传截图，管理员审核后开通。
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {planCards.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[2rem] border p-7 backdrop-blur-xl transition hover:-translate-y-1 ${
                plan.hot
                  ? "border-purple-300/40 bg-purple-500/10 shadow-2xl shadow-purple-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="text-xl font-black">{plan.name}</div>

                <div
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    plan.hot
                      ? "border-purple-300/30 bg-purple-500/20 text-purple-100"
                      : "border-white/10 bg-black/30 text-zinc-300"
                  }`}
                >
                  {plan.status}
                </div>
              </div>

              <div className="mt-5 flex items-end gap-2">
                <div
                  className={`text-4xl font-black ${
                    plan.hot ? "text-purple-100" : "text-white"
                  }`}
                >
                  {plan.price}
                </div>
                {plan.unit ? (
                  <div className="pb-1 text-sm text-zinc-500">{plan.unit}</div>
                ) : null}
              </div>

              <div
                className={`mt-4 text-3xl font-black ${
                  plan.hot ? "text-purple-100" : "text-white"
                }`}
              >
                {plan.limit}
              </div>

              <p className="mt-5 min-h-20 leading-7 text-zinc-400">
                {plan.desc}
              </p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        plan.hot ? "bg-purple-300" : "bg-emerald-400"
                      }`}
                    />
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href={plan.href}
                className={`mt-7 flex w-full items-center justify-center rounded-2xl px-5 py-4 font-black transition ${
                  plan.hot
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {plan.button}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
          >
            查看完整套餐
          </Link>

          <Link
            href="/checkout"
            className="inline-flex rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 font-black text-purple-100 transition hover:bg-purple-500/30"
          >
            去付款确认
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-8 py-4 font-black text-emerald-100 transition hover:bg-emerald-500/20"
          >
            查看会员中心
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
                三步直接出结果
              </h2>

              <p className="mt-6 leading-8 text-zinc-400">
                很多 AI 工具不好用，是因为用户不知道该怎么问。AI Bot Pro
                把常用场景整理成工具入口，你只需要输入主题，系统会自动套用对应场景。
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

      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-500/10 p-7 backdrop-blur-xl">
            <div className="mb-4 text-sm font-bold text-emerald-100/70">
              FREE START
            </div>
            <h3 className="text-3xl font-black text-emerald-100">
              先免费体验
            </h3>
            <p className="mt-4 leading-7 text-emerald-100/70">
              不登录每日 5 次，登录后每日 10 次。先体验工具效果，再决定是否升级 Pro。
            </p>
            <Link
              href="/chat"
              className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-200"
            >
              免费使用
            </Link>
          </div>

          <div className="rounded-[2rem] border border-purple-300/20 bg-purple-500/10 p-7 backdrop-blur-xl">
            <div className="mb-4 text-sm font-bold text-purple-100/70">
              PRO UPGRADE
            </div>
            <h3 className="text-3xl font-black text-purple-100">
              高频使用开通 Pro
            </h3>
            <p className="mt-4 leading-7 text-purple-100/70">
              Pro 每日 100 次，适合每天都要写内容、改文案、做运营、整理工作的人。
            </p>
            <Link
              href="/checkout"
              className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-200"
            >
              开通 Pro
            </Link>
          </div>

          <div className="rounded-[2rem] border border-blue-300/20 bg-blue-500/10 p-7 backdrop-blur-xl">
            <div className="mb-4 text-sm font-bold text-blue-100/70">
              SUPPORT
            </div>
            <h3 className="text-3xl font-black text-blue-100">人工审核</h3>
            <p className="mt-4 leading-7 text-blue-100/70">
              {settings.review_notice} 客服微信：
              <span className="font-black text-white">
                {settings.customer_wechat}
              </span>
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-2xl border border-blue-300/20 bg-blue-500/10 px-6 py-3 font-black text-blue-100 transition hover:bg-blue-500/20"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="mb-4 text-sm font-bold text-yellow-300">
            FAQ
          </div>

          <h2 className="text-4xl font-black md:text-5xl">
            常见问题
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
            >
              <h3 className="text-xl font-black">{item.q}</h3>
              <p className="mt-4 leading-7 text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 text-center backdrop-blur-xl md:p-16">
          <h2 className="text-4xl font-black md:text-6xl">
            现在就开始用 AI Bot Pro 提高效率
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            输入一个关键词或一句需求，快速生成文案、标题、广告词、短视频脚本、
            SEO 文章和工作汇报。先免费试用，满意再升级 Pro。
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-white/60">
            {settings.payment_notice}
          </div>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="inline-flex rounded-2xl bg-white px-10 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
            >
              免费开始使用
            </Link>

            <Link
              href="/checkout"
              className="inline-flex rounded-2xl border border-purple-300/30 bg-purple-500/20 px-10 py-4 text-lg font-black text-purple-100 transition hover:bg-purple-500/30"
            >
              开通 Pro
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-lg font-black text-white transition hover:bg-white/10"
            >
              查看会员中心
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
