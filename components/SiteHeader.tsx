"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    label: "工具",
    href: "/#tools",
  },
  {
    label: "额度",
    href: "/#plans",
  },
  {
    label: "流程",
    href: "/#steps",
  },
  {
    label: "价格",
    href: "/pricing",
  },
  {
    label: "会员中心",
    href: "/dashboard",
  },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href.startsWith("/#")) {
      return false;
    }

    return pathname === href;
  }

  return (
    <header className="relative z-30 mx-auto max-w-7xl px-6 py-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight"
          onClick={() => setOpen(false)}
        >
          AI Bot Pro
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition hover:text-white ${
                isActive(item.href) ? "text-white" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/10"
          >
            登录
          </Link>

          <Link
            href="/waitlist"
            className="rounded-full border border-purple-300/30 bg-purple-500/20 px-5 py-2 text-sm font-bold text-purple-100 transition hover:bg-purple-500/30"
          >
            申请 Pro
          </Link>

          <Link
            href="/chat"
            className="rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            立即使用
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          aria-label="打开菜单"
        >
          <span className="text-2xl leading-none">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open ? (
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive(item.href)
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-white/10" />

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
            >
              登录
            </Link>

            <Link
              href="/waitlist"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-purple-300/30 bg-purple-500/20 px-4 py-3 text-center text-sm font-black text-purple-100 transition hover:bg-purple-500/30"
            >
              申请 Pro 会员
            </Link>

            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-black transition hover:bg-zinc-200"
            >
              立即使用 AI 工具箱
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}