import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_BLOG_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // O painel e as rotas de API nunca entram em buscador.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
