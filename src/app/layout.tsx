import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/shared/i18n/language-switcher";
import "./globals.css";

export const metadata: Metadata = { title: "BeLikeBee" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations("app");

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <main className="mx-auto grid max-w-sm gap-6 px-6 py-16">
            <LanguageSwitcher label={t("language")} />
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
