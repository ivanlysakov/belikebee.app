import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { signedInAs, verifyAsAdmin } from "./helpers";

// What the browser's upload() sends to ask for a Vercel Blob upload token.
const photoTokenRequest = {
  data: { type: "blob.generate-client-token", payload: { pathname: "photo.jpg", clientPayload: null, multipart: false } },
};

test("a verified beekeeper adds a hive that anyone can see at /hives and on its own page", async ({ browser, page }) => {
  // /hives lists every test run's hives, so this one needs a name nobody else uses.
  const hiveName = `Hive ${randomUUID()}`;
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

  await page.getByLabel("Hive name").fill(hiveName);
  await page.getByLabel("Description (optional)").fill("Carniolan bees");
  await page.getByRole("button", { name: "Add hive" }).click();
  await expect(page.getByText("Carniolan bees")).toBeVisible();

  await page.getByRole("link", { name: "All apiaries" }).click();
  await expect(page.getByText("Vorzel, Kyiv region · 1 hive")).toBeVisible();

  const visitor = await browser.newPage();
  await visitor.goto("/");
  await visitor.getByRole("link", { name: "Browse hives" }).click();
  await expect(visitor).toHaveURL("/hives");
  const hive = visitor.getByRole("listitem").filter({ hasText: hiveName });
  await expect(hive).toContainText("Linden Hill · Vorzel, Kyiv region");
  await expect(hive).toContainText("Carniolan bees");

  await hive.getByRole("link", { name: hiveName }).click();
  await expect(visitor.getByRole("heading", { level: 1, name: hiveName })).toBeVisible();
  await expect(visitor.getByText("Vorzel, Kyiv region")).toBeVisible();
  await expect(visitor.getByText("Carniolan bees")).toBeVisible();
  await expect(visitor.getByText("Linden Hill")).toBeVisible();
  await expect(visitor.getByText("an apiary of 1 hive")).toBeVisible();
  await expect(visitor.getByRole("heading", { name: "Renting opens together with plans" })).toBeVisible();
  await visitor.close();
});

test("a hive that does not exist is a 404", async ({ page }) => {
  expect((await page.goto("/hives/no-such-hive"))?.status()).toBe(404);
});

test("a client cannot manage apiaries or upload photos", async ({ page }) => {
  await signedInAs(page, "Client");
  await expect(page.getByRole("link", { name: "My apiaries" })).toHaveCount(0);

  await page.goto("/apiaries");
  await expect(page.getByText("Only beekeepers can manage apiaries.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create apiary" })).toHaveCount(0);
  expect((await page.request.post("/api/apiary/upload", photoTokenRequest)).status()).toBe(403);
});

test("a signed-out visitor is sent to sign in and cannot upload photos", async ({ page }) => {
  await page.goto("/apiaries");
  await expect(page).toHaveURL("/sign-in");
  expect((await page.request.post("/api/apiary/upload", photoTokenRequest)).status()).toBe(403);
});

test("a photo upload that keeps failing gives up after 60 s", async ({ browser, page }) => {
  await verifyAsAdmin(browser, await signedInAs(page, "Beekeeper"));
  // Every request to Blob fails like a CORS-blocked rejection, so upload() keeps retrying.
  await page.route("https://vercel.com/api/blob/**", (route) => route.abort());
  await page.clock.install();
  await page.goto("/apiaries");

  await page.getByLabel("Photo (optional)").setInputFiles({
    name: "hive.png",
    mimeType: "image/png",
    buffer: Buffer.from("not really a png"),
  });
  await expect(page.getByText("Uploading the photo…")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create apiary" })).toBeDisabled();

  await page.clock.runFor(61_000);
  await expect(page.getByText("The photo could not be uploaded. Try another file.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create apiary" })).toBeEnabled();
});
