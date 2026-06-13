"use client";

import Link from "next/link";

const adminCards = [
  {
    title: "套餐管理",
    desc: "手动为用户开通 Free / Pro，设置每日额度和到期时间。",
    href: "/admin/plans",
    badge: "用户套餐",
    className: "border-emerald-300/20 bg-emerald-500/10",
  },
  {
    title: "提交记录",
    desc: "查看 Pro 申请、联系反馈，一键开通 Pro，复制用户 ID。",
    href: "/admin/submissions",
    badge: "申请审核",
    className: "border-purple-300/20 bg-purple-500/10",
  },
  {
    title: "开通记录",
    desc: "查看 Pro 订单记录，停用、恢复、标记退款、检查过期 Pro。",
    href: "/admin/orders",
    badge: "订单记录",
    className: "border-blue-300/20 bg-blue-500/10",
  },
];

const quickLinks = [
  {
    title: "会员中心",
    href: "/dashboard",
  },
  {
    title: "AI 工具",
    href: "/chat",
  },
  {
    title: "价格页",
    href: "/pricing",
  },
  {
    title: "申请 Pro",
    href: "/waitlist",
  },
];

export default function AdminHomePage() {
  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              AI Bot Pro
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Link href="/admin" className="text-white">
                后台首页
              </Link>

              <Link href="/admin/plans" className="hover:text-white">
                套餐管理
              </Link>

              <Link href="/admin/submissions" className="hover:text-white">
                提交记录
              </Link>

              <Link href="/admin/orders" className="hover:text-white">
                开通记录
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
              >
                退出后台
              </button>
            </div>
          </nav>

          <div className="py-16 md:py-24">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              AI Bot Pro 管理后台
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              后台控制台
              <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                管理用户、申请和 Pro 开通记录
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              这里是后台统一入口。你可以快速进入套餐管理、提交记录、开通记录，也可以跳转到前台页面检查用户体验。
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {adminCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-[2rem] border p-7 transition hover:-translate-y-1 ${card.className}`}
            >
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-white/70">
                {card.badge}
              </div>

              <h2 className="text-3xl font-black">{card.title}</h2>

              <p className="mt-4 min-h-20 leading-7 text-white/60">
                {card.desc}
              </p>

              <div className="mt-8 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition group-hover:bg-zinc-200">
                进入管理 →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">快捷入口</h2>
              <p className="mt-2 text-sm text-white/50">
                快速查看前台页面，确认用户看到的内容是否正常。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center font-black text-white transition hover:bg-white/10"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-7">
          <h2 className="text-2xl font-black text-yellow-100">使用提醒</h2>

          <div className="mt-4 space-y-2 text-sm leading-7 text-yellow-100/75">
            <p>1. 用户申请 Pro 后，优先去「提交记录」查看。</p>
            <p>2. 如果申请里有用户 ID，可以直接点「一键开通 Pro」。</p>
            <p>3. 开通后可以去「开通记录」查看订单和到期时间。</p>
            <p>4. 如果用户退款或违规，可以在「开通记录」里停用 Pro。</p>
          </div>
        </div>
      </section>
    </main>
  );
}