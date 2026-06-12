import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Bot Pro - 一站式 AI 工具箱",
  description:
    "AI Bot Pro 是一站式 AI 效率工具箱，支持 AI 聊天、爆款文案、标题生成、广告优化、短视频脚本、SEO文章、日报周报、代码助手和文本润色，输入简单需求即可快速生成结果。",
  keywords: [
    "AI工具箱",
    "AI Bot Pro",
    "AI写作",
    "AI文案生成",
    "爆款文案",
    "标题生成",
    "广告优化",
    "短视频脚本",
    "SEO文章",
    "日报周报",
    "代码助手",
    "AI效率工具",
  ],
  authors: [{ name: "AI Bot Pro" }],
  creator: "AI Bot Pro",
  publisher: "AI Bot Pro",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI Bot Pro - 一站式 AI 工具箱",
    description:
      "集成 AI 聊天、爆款文案、标题生成、广告优化、短视频脚本、SEO文章、日报周报、代码助手等常用 AI 工具。",
    url: "https://aibotpro.top",
    siteName: "AI Bot Pro",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Bot Pro - 一站式 AI 工具箱",
    description:
      "不会写提示词也能用，输入简单需求，AI 自动帮你生成文案、标题、脚本、文章和方案。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}