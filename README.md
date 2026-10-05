<p align="center">
  <img src="public/og/en.png" alt="CleanTime – dry cleaning and laundry in Sofia" width="820">
</p>

<h1 align="center">CleanTime</h1>

<p align="center">
  The website of CleanTime, a dry cleaning and laundry business with two shops in central Sofia.<br>
  Three languages, 3D scenes, a chat assistant and everything Google needs.
</p>

<p align="center">
  <a href="https://cleantime-six.vercel.app"><b>🌐 See it live → cleantime-six.vercel.app</b></a>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-35d6d0?style=flat-square">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-0b1b2b?style=flat-square&logo=nextdotjs">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-0b1b2b?style=flat-square&logo=tailwindcss">
  <img alt="three.js" src="https://img.shields.io/badge/three.js-3D-0b1b2b?style=flat-square&logo=threedotjs">
  <img alt="Languages" src="https://img.shields.io/badge/languages-BG%20·%20EN%20·%20DE-0c8f8c?style=flat-square">
</p>

---

## What's inside

| | |
|---|---|
| 🌍 **Three languages** | Bulgarian, English and German, each on its own address (`/bg`, `/en`, `/de`). |
| 🫧 **3D bubbles** | Soap bubbles in the hero that float, move away from the mouse and scatter when tapped. |
| 🧥 **3D hanger** | A chrome clothes hanger at the end of the page that turns with scrolling and spins when tapped. |
| 🃏 **Cards with depth** | Service cards tilt toward the mouse or under a finger, with a glare. |
| 💬 **Assistant** | A chat covering about 40 topics: services, stains, care labels, dyeing, shops. Understands all three languages. |
| 🏷️ **Care label guide** | What the professional cleaning symbols mean. |
| ↔️ **Before and after** | A slider for comparing photos. |
| 📍 **Two shops** | Map, phone and directions for each. |
| 📱 **Phone first** | Full-screen menu, a "Call" bar, touch effects. |
| 🔎 **For Google** | Local business data, questions and answers, sitemap, share images. |

There are no prices and no online ordering on the site: that was agreed with the client. The main action everywhere is a phone call.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

The site starts at [http://localhost:3000](http://localhost:3000) and redirects to `/bg`.

| Command | What it does |
|---|---|
| `npm run dev` | Runs the site for development. |
| `npm run build` | Builds the production version. |
| `npm run start` | Serves the built version. |
| `npm run lint` | Checks the code. |

## Where things live

```
src/
├── app/
│   ├── [lang]/           the page and shared layout for each language
│   ├── globals.css       colours, animations, 3D tilt
│   ├── sitemap.ts        sitemap
│   ├── robots.ts         rules for search engines
│   └── manifest.ts       icon and name for a phone's home screen
├── components/
│   ├── three/            the 3D scenes: bubbles, hanger and their shared base
│   ├── Scene3D.tsx       loads a 3D scene after first paint
│   ├── Assistant.tsx     the assistant chat
│   ├── Tilt.tsx          a card that tilts in 3D
│   ├── BeforeAfter.tsx   the before and after slider
│   ├── MobileMenu.tsx    the phone menu
│   ├── Effects.tsx       the progress bar and the reveal on scroll
│   └── Logo.tsx          the logo
├── lib/
│   ├── site.ts           shops, phone numbers, the site address
│   ├── i18n.ts           the list of languages
│   └── assistant.ts      which words lead to which answer
└── messages/
    ├── bg.json           every text in Bulgarian
    ├── en.json           … in English
    └── de.json           … in German
```

## How to change something

**Text.** Everything a visitor reads is in `src/messages/`. Make each change in all three files, under the same keys.

**Phone or address.** In `src/lib/site.ts`; how the address is written in each language is under `locations.items` in the three language files.

**A new assistant answer.** The text goes in `assistant.kb` in the three language files, and the words that trigger it go in `knowledge` in `src/lib/assistant.ts`. The assistant never makes anything up: it answers only with text from these files, and when it does not know, it shows the phone numbers.

**A new language.** A new file in `src/messages/`, registered in `src/lib/i18n.ts`, plus a share image in `public/og/`.

**Photos.** The grey boxes marked "Photo coming soon" are where the real photos of the shops go.

## Deployment

Automatic: every change to `main` is deployed to Vercel and is live in about a minute. Every other branch gets its own preview address.

Two settings control how search engines see the site:

| Setting | What it is for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The real address of the site, for example `https://cleantime.bg`. Without it the Vercel address is used. |
| `NEXT_PUBLIC_INDEXABLE` | Set to `true` to let Google index the site. Without it the site is hidden from search engines. |

## Before going live on the real domain

- [ ] Real photos of both shops and at least one before and after pair
- [ ] Opening hours for both shops
- [ ] The client has read the texts, especially the German and English
- [ ] The domain points to Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_INDEXABLE=true` are set

## Rules that keep the site fast

- Nothing starts invisible on first paint. The reveal on scroll switches on only after the page has loaded, and only for content below the screen.
- The 3D scenes load after the text and buttons, and pause while off screen.
- On phones there are fewer, lighter bubbles.
- When a device has animations turned off, the 3D scenes and motion do not run.

---

<p align="center">
  <b>Version 1.0.0</b> · Nikolai Todorov · <a href="https://wavsy.dev">Wavsy</a>
</p>
