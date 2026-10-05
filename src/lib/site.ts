// The client's own domain once it is set; until then the Vercel address, so
// share images and canonical links resolve on the preview.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// Stays off until the site moves to the client's own domain, so the preview
// address never competes with her live site in Google.
export const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";

export const locations = [
  {
    id: "graf",
    phone: "+359896825999",
    phoneLabel: "0896 825 999",
    mapQuery: "ул. Граф Игнатиев 29, София",
    streetAddress: "ul. Graf Ignatiev 29",
  },
  {
    id: "solunska",
    phone: "+359893983225",
    phoneLabel: "0893 983 225",
    mapQuery: "ул. Солунска 11, София",
    streetAddress: "ul. Solunska 11",
  },
] as const;

export const mainPhone = locations[0];

export const email = "snejaka78@gmail.com";
export const viberLink = `viber://chat?number=${encodeURIComponent(mainPhone.phone)}`;

export function mapLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapEmbed(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
