import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale } from "@/shared/i18n/locale";

// No locale in the URL: the language comes from the cookie set by the switcher, then the browser.
export default getRequestConfig(async () => {
  const locale = resolveLocale({
    cookie: (await cookies()).get(LOCALE_COOKIE)?.value,
    acceptLanguage: (await headers()).get("accept-language") ?? undefined,
  });
  // Imported per request, not at the top: messages.ts imports the modules, their server components
  // import next-intl, and next-intl imports this file. A static import made that a cycle.
  const { messages } = await import("./messages");
  return { locale, messages: messages[locale], timeZone: "Europe/Kyiv" };
});
