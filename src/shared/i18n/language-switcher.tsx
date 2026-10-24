"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALES, type Locale } from "./locale";

// Each language is named in itself, so the switcher reads the same in every locale.
const NAMES: Record<Locale, string> = { uk: "Українська", en: "English" };

export function LanguageSwitcher({ label }: { label: string }) {
  const current = useLocale();
  const router = useRouter();

  function choose(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <nav aria-label={label} className="flex gap-3 text-sm">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={locale === current}
          disabled={locale === current}
          onClick={() => choose(locale)}
          className="underline disabled:font-semibold disabled:no-underline"
        >
          {NAMES[locale]}
        </button>
      ))}
    </nav>
  );
}
