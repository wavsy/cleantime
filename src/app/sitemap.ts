import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${siteUrl}/${l}`]),
  );
  return locales.map((l) => ({
    url: `${siteUrl}/${l}`,
    alternates: { languages },
  }));
}
