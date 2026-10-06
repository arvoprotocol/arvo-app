import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/"],
    },
    sitemap: "https://arvoprotocol.com/sitemap.xml",
    host: "https://arvoprotocol.com",
  };
}
