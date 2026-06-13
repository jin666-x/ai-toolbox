"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    label: "套餐价格",
    href: "/pricing",
  },
  {
    label: "申请 Pro",
    href: "/waitlist",
  },
  {
    label: "会员中心",
    href: "/dashboard",
  },
];

export default function SiteHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href.startsWith("/#")) {
      return pathname === "/";
    }

    return pathname === href;
  }

  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-2xl font-black tracking-tight">
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

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/10 sm:inline-flex"
        >
          登录
        </Link>

        <Link
          href="/chat"
          className="rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          立即使用
        </Link>
      </div>
    </header>
  );
}