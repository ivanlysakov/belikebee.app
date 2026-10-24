import type { Locale } from "@/shared/i18n/locale";
import type { messages } from "./messages";

// Type-checks translation keys: t("identity.signUp.titel") is a compile error.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: (typeof messages)["en"];
  }
}
