import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Assistant } from "@/components/Assistant";
import { Effects } from "@/components/Effects";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/MobileMenu";
import { Scene3D } from "@/components/Scene3D";
import { Tilt } from "@/components/Tilt";
import { buildTopics } from "@/lib/assistant";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { locations, mainPhone, mapEmbed, mapLink, siteUrl } from "@/lib/site";

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CareSymbol({ symbol }: { symbol: string }) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden
      className="pop text-ink"
    >
      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="2.5" />
      {symbol === "X" ? (
        <path
          d="M8 8l40 40M48 8L8 48"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ) : (
        <text
          x="28"
          y="36"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="currentColor"
        >
          {symbol}
        </text>
      )}
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-aqua-deep uppercase">
      {children}
    </p>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const jsonLd = locations.map((loc) => ({
    "@context": "https://schema.org",
    "@type": "DryCleaningOrLaundry",
    name: `CleanTime – ${t.locations.items[loc.id].name}`,
    url: `${siteUrl}/${lang}`,
    image: `${siteUrl}/og/${lang}.png`,
    logo: `${siteUrl}/logo.svg`,
    description: t.meta.description,
    telephone: loc.phone,
    hasMap: mapLink(loc.mapQuery),
    areaServed: { "@type": "City", name: "Sofia" },
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.streetAddress,
      addressLocality: "Sofia",
      addressCountry: "BG",
    },
  }));

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const nav = [
    { href: "#services", label: t.nav.services },
    { href: "#how", label: t.nav.how },
    { href: "#results", label: t.nav.results },
    { href: "#locations", label: t.nav.locations },
  ];

  const phones = locations.map((loc) => ({
    href: `tel:${loc.phone}`,
    label: loc.phoneLabel,
  }));

  return (
    <>
      <Effects />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <header className="sticky top-0 z-40 border-b border-line/70 bg-mist/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link href={`/${lang}`} aria-label="CleanTime">
            <Logo />
          </Link>

          <nav className="ml-auto hidden gap-7 text-sm text-ink-soft md:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>

          <nav
            aria-label={t.nav.language}
            className="ml-auto flex rounded-full border border-line bg-foam p-0.5 text-xs font-semibold md:ml-0"
          >
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                hrefLang={l}
                aria-current={l === lang ? "page" : undefined}
                className={`rounded-full px-2.5 py-1.5 uppercase ${
                  l === lang ? "bg-ink text-foam" : "text-ink-soft hover:text-ink"
                }`}
              >
                {l}
              </Link>
            ))}
          </nav>

          <a
            href={`tel:${mainPhone.phone}`}
            className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-foam hover:bg-aqua-deep sm:flex"
          >
            <PhoneIcon />
            {t.nav.call}
          </a>

          <MobileMenu label={t.nav.menu} items={nav} phones={phones} />
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="bubble absolute -top-24 -right-24 size-96 rounded-full bg-aqua/30 blur-3xl"
          />
          <Scene3D scene="bubbles" />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24 lg:pb-28">
            <div className="relative">
              <Eyebrow>{t.hero.eyebrow}</Eyebrow>
              <h1 className="font-display text-[2rem] leading-[1.12] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                {t.hero.title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                {t.hero.text}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`tel:${mainPhone.phone}`}
                  className="flex items-center gap-2 rounded-full bg-ink px-6 py-4 font-semibold text-foam hover:bg-aqua-deep"
                >
                  <PhoneIcon />
                  {t.hero.callPrimary}
                </a>
                <a
                  href="#locations"
                  className="rounded-full border border-ink/15 bg-foam px-6 py-4 font-semibold hover:border-ink"
                >
                  {t.hero.seeLocations}
                </a>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                {t.hero.facts.map((fact) => (
                  <li key={fact} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-aqua-deep" />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <Tilt
              max={7}
              className="placeholder grid aspect-[4/3] place-items-center sm:aspect-[4/5] rounded-[2rem] text-sm text-ink-soft shadow-2xl shadow-ink/10"
            >
              <span className="pop">{t.gallery.placeholder}</span>
            </Tilt>
          </div>
        </section>

        <section id="services" className="bg-foam py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Eyebrow>{t.services.eyebrow}</Eyebrow>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.services.title}
            </h2>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {t.services.items.map((item, i) => (
                <li key={item.title} className="reveal">
                  <Tilt className="h-full rounded-3xl border border-line bg-mist p-7 hover:border-aqua-deep hover:bg-foam hover:shadow-xl hover:shadow-ink/10">
                    <span className="pop block font-display text-sm font-medium text-aqua-deep">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="pop mt-6 text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">
                      {item.text}
                    </p>
                  </Tilt>
                </li>
              ))}
              <li className="reveal flex flex-col justify-between rounded-3xl bg-ink p-7 text-foam">
                <p className="text-xl font-semibold">{t.cta.title}</p>
                <a
                  href={`tel:${mainPhone.phone}`}
                  className="mt-8 flex items-center gap-2 self-start rounded-full bg-aqua px-5 py-3 font-semibold text-ink hover:bg-foam"
                >
                  <PhoneIcon />
                  {mainPhone.phoneLabel}
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section id="how" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Eyebrow>{t.how.eyebrow}</Eyebrow>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.how.title}
            </h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {t.how.steps.map((step, i) => (
                <li key={step.title} className="reveal border-t-2 border-ink pt-6">
                  <span className="font-display text-5xl font-bold text-aqua-deep">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="care" className="bg-foam py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Eyebrow>{t.care.eyebrow}</Eyebrow>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.care.title}
            </h2>
            <p className="mt-4 max-w-2xl text-ink-soft">{t.care.text}</p>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.care.items.map((item) => (
                <li key={item.symbol} className="reveal">
                  <Tilt className="h-full rounded-3xl border border-line bg-mist p-7">
                    <CareSymbol symbol={item.symbol} />
                    <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">
                      {item.text}
                    </p>
                  </Tilt>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-2xl text-sm text-ink-soft">{t.care.note}</p>
          </div>
        </section>

        <section id="results" className="bg-ink py-20 text-foam lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-aqua uppercase">
              {t.results.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.results.title}
            </h2>
            <p className="mt-4 text-foam/70">{t.results.text}</p>
            <div className="reveal mt-10">
              <BeforeAfter
                beforeLabel={t.results.before}
                afterLabel={t.results.after}
                sliderLabel={t.results.sliderLabel}
                before={
                  <div className="placeholder-dark grid h-full place-items-center text-sm text-foam/60">
                    {t.gallery.placeholder}
                  </div>
                }
                after={
                  <div className="placeholder grid h-full place-items-center text-sm text-ink-soft">
                    {t.gallery.placeholder}
                  </div>
                }
              />
            </div>
          </div>
        </section>

        <section className="bg-foam py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Eyebrow>{t.gallery.eyebrow}</Eyebrow>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.gallery.title}
            </h2>
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`placeholder reveal grid min-h-40 place-items-center rounded-3xl p-4 text-center text-sm text-ink-soft ${
                    i === 0 ? "col-span-2 md:row-span-2 md:min-h-96" : ""
                  }`}
                >
                  {t.gallery.placeholder}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Eyebrow>{t.faq.eyebrow}</Eyebrow>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.faq.title}
            </h2>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {t.faq.items.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-foam text-xl leading-none transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-14 leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="locations" className="bg-foam py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Eyebrow>{t.locations.eyebrow}</Eyebrow>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.locations.title}
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {locations.map((loc) => {
                const item = t.locations.items[loc.id];
                return (
                  <article
                    key={loc.id}
                    className="reveal overflow-hidden rounded-3xl border border-line bg-mist"
                  >
                    <iframe
                      title={item.name}
                      src={mapEmbed(loc.mapQuery)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-56 w-full border-0"
                    />
                    <div className="p-7">
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="mt-1 text-ink-soft">{item.address}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <a
                          href={`tel:${loc.phone}`}
                          className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-foam hover:bg-aqua-deep"
                        >
                          <PhoneIcon />
                          {loc.phoneLabel}
                        </a>
                        <a
                          href={mapLink(loc.mapQuery)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-ink/15 px-5 py-3 font-semibold hover:border-ink"
                        >
                          {t.locations.directions}
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="relative overflow-hidden bg-ink text-foam">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                {t.cta.title}
              </h2>
              <p className="mt-5 max-w-md text-lg text-foam/70">{t.cta.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {locations.map((loc) => (
                  <a
                    key={loc.id}
                    href={`tel:${loc.phone}`}
                    className="flex items-center gap-2 rounded-full bg-aqua px-6 py-4 font-semibold text-ink hover:bg-foam"
                  >
                    <PhoneIcon />
                    {loc.phoneLabel}
                  </a>
                ))}
              </div>
            </div>
            <div className="relative h-80 lg:h-[28rem]">
              <Scene3D scene="hanger" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-foam pt-10 pb-28 sm:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo className="text-ink" />
          <p>
            © {new Date().getFullYear()} CleanTime. {t.footer.rights}
          </p>
          <a
            href="https://wavsy.dev"
            target="_blank"
            rel="noopener"
            className="hover:text-ink"
          >
            {t.footer.credit}
          </a>
        </div>
      </footer>

      <Assistant
        t={t.assistant}
        topics={buildTopics(t)}
        phones={phones}
      />

      <div className="call-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-foam/95 p-3 backdrop-blur sm:hidden">
        <a
          href={`tel:${mainPhone.phone}`}
          className="call-pulse flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-semibold text-foam"
        >
          <PhoneIcon />
          {t.nav.call} · {mainPhone.phoneLabel}
        </a>
      </div>
    </>
  );
}
