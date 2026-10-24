import { describe, expect, it } from "vitest";
import { resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it("uses the language cookie when it holds a supported locale", () => {
    expect(resolveLocale({ cookie: "en", acceptLanguage: "uk-UA,uk;q=0.9" })).toBe("en");
  });

  it("falls back to the browser language when the cookie is missing or unsupported", () => {
    expect(resolveLocale({ cookie: undefined, acceptLanguage: "en-US,en;q=0.9" })).toBe("en");
    expect(resolveLocale({ cookie: "de", acceptLanguage: "en-GB" })).toBe("en");
  });

  it("picks the most preferred supported browser language", () => {
    expect(resolveLocale({ cookie: undefined, acceptLanguage: "de;q=0.9,en;q=0.5,uk;q=0.8" })).toBe("uk");
  });

  it("defaults to Ukrainian when nothing matches", () => {
    expect(resolveLocale({ cookie: undefined, acceptLanguage: undefined })).toBe("uk");
    expect(resolveLocale({ cookie: "fr", acceptLanguage: "de-DE,fr;q=0.8" })).toBe("uk");
  });
});
