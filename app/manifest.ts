import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Bot Pro - 一站式 AI 工具箱",
    short_name: "AI Bot Pro",
    description:
      "AI 聊天、文案生成、标题生成、广告优化、短视频脚本、SEO文章、日报周报等 AI 效率工具。",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}