import { expect, test } from "@playwright/test";

const languages = [
  {
    locale: "en-US",
    browseHives: "Browse hives",
    title: "Rent a real hive at an apiary",
    rentalNote: "Renting opens together with plans. You can already look at the hives.",
    price: /price/i,
    rent: /^rent$/i,
  },
  {
    locale: "uk-UA",
    browseHives: "Переглянути вулики",
    title: "Орендуйте справжній вулик на пасіці",
    rentalNote: "Оренда відкриється разом із планами. Вулики вже можна переглянути.",
    price: /ціна/i,
    rent: /^орендувати$/i,
  },
];

for (const l of languages) {
  test.describe(l.locale, () => {
    test.use({ locale: l.locale });

    test("the guest's one primary action is a Browse hives button that opens /hives", async ({ page }) => {
      await page.goto("/");
      const browse = page.getByRole("link", { name: l.browseHives });
      await expect(browse).toHaveCount(1);
      await expect(browse).toHaveClass(/\bbg-primary\b/);
      await expect(browse).toHaveClass(/\bh-10\b/);
      await browse.click();
      await expect(page).toHaveURL("/hives");
    });

    test("the guest reads the approved headline and rental note, with no price or rent action", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(l.title);
      await expect(page.getByText(l.rentalNote)).toBeVisible();
      await expect(page.getByText(l.price)).toHaveCount(0);
      await expect(page.getByRole("link", { name: l.rent })).toHaveCount(0);
      await expect(page.getByRole("button", { name: l.rent })).toHaveCount(0);
    });
  });
}
