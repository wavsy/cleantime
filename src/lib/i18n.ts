import bg from "@/messages/bg.json";
import en from "@/messages/en.json";
import de from "@/messages/de.json";

export const locales = ["bg", "en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bg";

export type Dictionary = typeof bg;

const dictionaries: Record<Locale, Dictionary> = { bg, en, de };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
