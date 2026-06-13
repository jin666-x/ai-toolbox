import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://aibotpro.top";
const siteName = "AI Bot Pro";
const siteTitle = "AI Bot Pro - 一站式 AI 工具箱";
const siteDescription =
  "AI Bot Pro 是一站式 AI 效率工具箱，支持 AI 聊天、爆款文案、标题生成、广告优化、短视频脚本、SEO文章、日报周报、代码助手和文本润色，输入简单需求即可快速生成结果。";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },

  description: siteDescription,

  keywords: [
    "AI工具箱",
    "AI Bot Pro",
    "AI写作",
    "AI聊天助手",
    "AI文案生成",
    "爆款文案",
    "标题生成",
    "广告优化",
    "短视频脚本",
    "SEO文章",
    "日报周报",
    "代码助手",
    "文本润色",
    "AI效率工具",
    "AI办公工具",
    "AI内容创作",
    "自媒体工具",
    "运营工具",
    "AI营销工具",
    "AI工作助手",
  ],

  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  applicationName: siteName,
  generator: "Next.js",
  category: "AI Tools",

  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
    },
  },

  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: siteTitle,
    description:
      "集成 AI 聊天、爆款文案、标题生成、广告优化、短视频脚本、SEO文章、日报周报、代码助手等常用 AI 工具。",
    url: siteUrl,
    siteName,
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Bot Pro 一站式 AI 工具箱",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description:
      "不会写提示词也能用，输入简单需求，AI 自动帮你生成文案、标题、脚本、文章和方案。",
    images: ["/og-image.png"],
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  referrer: "origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
  colorScheme: "dark",
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
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
