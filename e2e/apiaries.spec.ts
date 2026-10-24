import { expect, test } from "@playwright/test";
import { signedInAs, verifyAsAdmin } from "./helpers";

test("a verified beekeeper creates an apiary and adds a hive", async ({ browser, page }) => {
  await verifyAsAdmin(browser, await signedInAs(page, "Beekeeper"));

  await page.getByRole("link", { name: "My apiaries" }).click();
  await expect(page).toHaveURL("/apiaries");
  await expect(page.getByText("No apiaries yet.")).toBeVisible();

  await page.getByLabel("Name").fill("Linden Hill");
  await page.getByLabel("Location").fill("Vorzel, Kyiv region");
  await page.getByRole("button", { name: "Create apiary" }).click();
  await expect(page.getByText("Vorzel, Kyiv region · no hives")).toBeVisible();

  await page.getByRole("link", { name: "Linden Hill" }).click();
  await expect(page.getByRole("heading", { name: "Linden Hill" })).toBeVisible();
  await expect(page.getByText("No hives yet.")).toBeVisible();

  await page.getByLabel("Hive name").fill("Hive 1");
  await page.getByLabel("Description (optional)").fill("Carniolan bees");
  await page.getByRole("button", { name: "Add hive" }).click();
  await expect(page.getByText("Carniolan bees")).toBeVisible();

  await page.getByRole("link", { name: "All apiaries" }).click();
  await expect(page.getByText("Vorzel, Kyiv region · 1 hive")).toBeVisible();
});

test("a client cannot manage apiaries", async ({ page }) => {
  await signedInAs(page, "Client");
  await expect(page.getByRole("link", { name: "My apiaries" })).toHaveCount(0);

  await page.goto("/apiaries");
  await expect(page.getByText("Only beekeepers can manage apiaries.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create apiary" })).toHaveCount(0);
});

test("a signed-out visitor is sent to sign in", async ({ page }) => {
  await page.goto("/apiaries");
  await expect(page).toHaveURL("/sign-in");
});
