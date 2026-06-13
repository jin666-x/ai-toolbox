import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aibotpro.top";

  const publicPages = [
    {
      path: "",
      priority: 1,
      changeFrequency: "daily" as const,
    },
    {
      path: "/chat",
      priority: 0.9,
      changeFrequency: "daily" as const,
    },
    {
      path: "/pricing",
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    {
      path: "/waitlist",
      priority: 0.8,
      changeFrequency: "weekly" as const,
    },
    {
      path: "/contact",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/about",
      priority: 0.6,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/privacy",
      priority: 0.4,
      changeFrequency: "yearly" as const,
    },
    {
      path: "/terms",
      priority: 0.4,
      changeFrequency: "yearly" as const,
    },
  ];

  return publicPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}