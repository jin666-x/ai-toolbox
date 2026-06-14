import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aibotpro.top";
  const now = new Date();

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
      path: "/checkout",
      priority: 0.8,
      changeFrequency: "weekly" as const,
    },
    {
      path: "/waitlist",
      priority: 0.7,
      changeFrequency: "weekly" as const,
    },
    {
      path: "/contact",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
  ];

  return publicPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
