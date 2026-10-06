import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://arvoprotocol.com";

  const routes = [
    { path: "", priority: 1.0, frequency: "weekly" as const },
    { path: "/token", priority: 0.9, frequency: "monthly" as const },
    { path: "/treasury", priority: 0.9, frequency: "monthly" as const },
    { path: "/vaults", priority: 0.9, frequency: "monthly" as const },
    { path: "/platform", priority: 0.9, frequency: "monthly" as const },
    { path: "/roadmap", priority: 0.8, frequency: "monthly" as const },
    { path: "/team", priority: 0.7, frequency: "monthly" as const },
    { path: "/faq", priority: 0.7, frequency: "monthly" as const },
    { path: "/contact", priority: 0.6, frequency: "yearly" as const },
    { path: "/legal", priority: 0.4, frequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.3, frequency: "yearly" as const },
  ];

  return routes.map(({ path, priority, frequency }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: frequency,
    priority,
  }));
}
