import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cardvite.vn";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/*?*g=",
          "/*?*mode=live-display",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
