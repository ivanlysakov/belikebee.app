export const LOCALES = ["uk", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "uk";
export const LOCALE_COOKIE = "NEXT_LOCALE";

function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

// The user's choice (cookie) wins, then the browser's preferred languages, then Ukrainian.
export function resolveLocale({ cookie, acceptLanguage }: { cookie?: string; acceptLanguage?: string }): Locale {
  if (isLocale(cookie)) return cookie;

  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return { language: tag.split("-")[0].toLowerCase(), weight: q ? Number(q.trim().slice(2)) : 1 };
    })
    .sort((a, b) => b.weight - a.weight);

  const match = preferred.find(({ language }) => isLocale(language))?.language;
  return isLocale(match) ? match : DEFAULT_LOCALE;
}
