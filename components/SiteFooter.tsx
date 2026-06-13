import Link from "next/link";

const footerLinks = [
  {
    label: "关于我们",
    href: "/about",
  },
  {
    label: "联系我们",
    href: "/contact",
  },
  {
    label: "隐私政策",
    href: "/privacy",
  },
  {
    label: "服务条款",
    href: "/terms",
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
  {
    label: "登录",
    href: "/login",
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-white/10 px-6 py-8 text-center text-sm text-zinc-500">
      <div className="mb-4 flex flex-wrap justify-center gap-5">
        {footerLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div>© 2026 AI Bot Pro. All rights reserved.</div>
    </footer>
  );
}