import { expect, test } from "@playwright/test";
import { signedInAs, verifyAsAdmin } from "./helpers";

test("a beekeeper manages apiaries only after an admin verifies them", async ({ browser, page }) => {
  const email = await signedInAs(page, "Beekeeper");

  await page.goto("/apiaries");
  await expect(
    page.getByText("An admin has to verify your beekeeper account before you can manage apiaries."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Create apiary" })).toHaveCount(0);

  await verifyAsAdmin(browser, email);

  await page.reload();
  await expect(page.getByRole("button", { name: "Create apiary" })).toBeVisible();
});

test("only admins open the verification page", async ({ page }) => {
  await page.goto("/admin/beekeepers");
  await expect(page).toHaveURL("/sign-in");

  await signedInAs(page, "Beekeeper");
  await expect(page.getByRole("link", { name: "Verify beekeepers" })).toHaveCount(0);
  await page.goto("/admin/beekeepers");
  await expect(page.getByText("Only admins can verify beekeepers.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify" })).toHaveCount(0);
});
