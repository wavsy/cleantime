import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { indexable, siteUrl } from "@/lib/site";
import "../globals.css";

const body = Onest({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#f3f7fa",
};

const ogLocales = { bg: "bg_BG", en: "en_US", de: "de_DE" } as const;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: t.meta.title,
    description: t.meta.description,
    robots: indexable ? undefined : { index: false, follow: false },
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
        "x-default": "/bg",
      },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: `/${lang}`,
      siteName: "CleanTime",
      locale: ogLocales[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocales[l]),
      type: "website",
      images: [{ url: `/og/${lang}.png`, width: 1200, height: 630, alt: t.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [`/og/${lang}.png`],
    },
    applicationName: "CleanTime",
    formatDetection: { telephone: true, address: true },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${body.variable} ${display.variable} antialiased`}
    >
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
