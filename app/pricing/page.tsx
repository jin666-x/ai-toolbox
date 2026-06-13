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

const faqs = [
  {
    q: "现在可以直接支付购买吗？",
    a: "当前先走人工审核流程。你可以进入付款确认页，选择套餐并提交付款凭证，管理员确认后会为账号开通 Pro。",
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
    a: "登录后进入会员中心，可以看到当前套餐、今日已用次数、今日剩余次数和 Pro 开通记录。",
  },
];

export default function PricingPage() {
  const [settings, setSettings] = useState<Required<PublicSettings>>(
    defaultSettings
  );
  const [loadingSettings, setLoadingSettings] = useState(true);

  const plans = useMemo(
    () => [
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
        price: settings.monthly_price,
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
          "管理员审核后开通",
        ],
        button: "提交付款确认",
        href: "/checkout",
        hot: true,
        status: "人工审核",
        note: "提交付款确认后，由管理员审核并开通 Pro。",
      },
      {
        name: "Pro 年卡",
        price: settings.yearly_price,
        unit: "/ 年",
        desc: "适合长期使用 AI 工具提升效率的个人、团队和创业者。",
        features: [
          "全年使用更划算",
          "每日 100 次 AI 使用额度",
          "优先体验新工具",
          "适合长期内容生产",
          "适合副业、自媒体、创业者",
          "后续可升级更多权益",
          "支持人工审核开通",
          "适合重度使用用户",
        ],
        button: "提交年卡确认",
        href: "/checkout",
        hot: false,
        status: "人工审核",
        note: "提交付款确认后由管理员审核开通，开通成功后会邮件通知。",
      },
    ],
    [settings.monthly_price, settings.yearly_price]
  );

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
        console.error("读取价格页配置失败：", error);
      } finally {
        setLoadingSettings(false);
      }
    }

    loadSettings();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_35%)]" />

      <SiteHeader />

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
          免费版适合体验，Pro 版适合高频创作、文案生成、短视频脚本、
          广告优化和办公效率提升。当前 Pro 会员支持付款确认后人工审核开通。
        </p>

        {settings.site_announcement ? (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4 text-sm leading-7 text-blue-100/80">
            {loadingSettings ? "正在读取最新配置..." : settings.site_announcement}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-black transition hover:bg-zinc-200"
          >
            免费开始使用
          </Link>

          <Link
            href="/checkout"
            className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-8 py-4 text-lg font-black text-purple-100 transition hover:bg-purple-500/30"
          >
            提交付款确认
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
          >
            查看会员中心
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
                可人工审核开通
              </h2>

              <p className="mt-6 leading-8 text-zinc-400">
                当前系统已经支持登录账号、会员中心、每日使用次数、Free / Pro
                套餐识别、会员开通、到期降级和开通记录。你可以通过付款确认页提交信息，管理员审核后开通。
              </p>

              <div className="mt-6 rounded-3xl border border-purple-300/20 bg-purple-500/10 p-5">
                <h3 className="font-black text-purple-100">付款说明</h3>
                <p className="mt-2 text-sm leading-7 text-purple-100/75">
                  {settings.payment_notice}
                </p>

                <p className="mt-2 text-sm leading-7 text-purple-100/75">
                  客服微信：
                  <span className="ml-1 font-black text-white">
                    {settings.customer_wechat}
                  </span>
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/checkout"
                  className="inline-flex rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-200"
                >
                  去付款确认
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10"
                >
                  查看会员中心
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-3xl font-black">5 次/天</div>
                <div className="mt-2 text-zinc-400">
                  未登录用户每日体验次数
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-3xl font-black">10 次/天</div>
                <div className="mt-2 text-zinc-400">
                  Free 免费账号每日次数
                </div>
              </div>

              <div className="rounded-3xl border border-purple-300/20 bg-purple-500/10 p-6">
                <div className="text-3xl font-black text-purple-100">
                  100 次/天
                </div>
                <div className="mt-2 text-purple-100/70">
                  Pro 会员账号每日次数
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-6">
                <div className="text-3xl font-black text-emerald-100">
                  {settings.monthly_price} / {settings.yearly_price}
                </div>
                <div className="mt-2 text-emerald-100/70">
                  价格由后台配置页统一维护
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

      <SiteFooter />
    </main>
  );
}
