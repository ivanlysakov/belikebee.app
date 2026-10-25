import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale } from "@/shared/i18n/locale";
import { messages } from "./messages";

// No locale in the URL: the language comes from the cookie set by the switcher, then the browser.
export default getRequestConfig(async () => {
  const locale = resolveLocale({
    cookie: (await cookies()).get(LOCALE_COOKIE)?.value,
    acceptLanguage: (await headers()).get("accept-language") ?? undefined,
  });
  return { locale, messages: messages[locale], timeZone: "Europe/Kyiv" };
});
