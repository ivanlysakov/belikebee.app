import { expect, test } from "@playwright/test";

// A browser that prefers Ukrainian, so the cookie and the default are what decide the language.
test.use({ locale: "uk-UA" });

test("shows Ukrainian first; the switcher changes the language and remembers it", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.getByRole("heading", { name: "Створити акаунт" })).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();

  await page.getByRole("button", { name: "Українська" }).click();
  await expect(page.getByRole("heading", { name: "Створити акаунт" })).toBeVisible();
});

test("translates errors returned by the server", async ({ page }) => {
  const email = `user-${Date.now()}@example.test`;
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto("/sign-up");
    await page.getByLabel("Імʼя").fill("Олена");
    await page.getByLabel("Електронна пошта").fill(email);
    await page.getByLabel("Пароль").fill("correct horse battery");
    await page.getByRole("button", { name: "Створити акаунт" }).click();
    if (attempt === 0) await expect(page.getByText("Акаунт створено.")).toBeVisible();
  }
  await expect(page.getByText("Акаунт із цією поштою вже існує.")).toBeVisible();
});
