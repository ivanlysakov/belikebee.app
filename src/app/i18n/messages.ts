import { messages as identity } from "@/modules/identity";
import type { Locale } from "@/shared/i18n/locale";
import appEn from "../messages/en.json";
import appUk from "../messages/uk.json";

// One namespace per module, so texts live next to the code that shows them.
export const messages = {
  uk: { app: appUk, identity: identity.uk },
  en: { app: appEn, identity: identity.en },
} satisfies Record<Locale, unknown>;
