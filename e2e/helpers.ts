import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { expect, type Browser, type Page } from "@playwright/test";
import { TEST_DATABASE_URL } from "../test/test-database.ts";

const password = "correct horse battery";

// Random, not time-based: parallel workers each run their own copy of this module.
export function uniqueEmail() {
  return `user-${randomUUID()}@example.test`;
}

export async function signUp(page: Page, email: string, role: "Client" | "Beekeeper" = "Client") {
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Olena");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("radio", { name: new RegExp(role) }).check();
  await page.getByRole("button", { name: "Create account" }).click();
}

export async function signIn(page: Page, email: string, withPassword = password) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(withPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
}

// Signs up and signs in a new user; returns their email.
export async function signedInAs(page: Page, role: "Client" | "Beekeeper") {
  const email = uniqueEmail();
  await signUp(page, email, role);
  await expect(page.getByText("Account created.")).toBeVisible();
  await signIn(page, email);
  await expect(page).toHaveURL("/");
  return email;
}

// Runs the real `pnpm admin:promote` script against the test database.
export function promoteToAdmin(email: string) {
  execFileSync("pnpm", ["--silent", "admin:promote", email], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "pipe",
  });
}

// A fresh admin, in their own browser context, verifies the beekeeper on /admin/beekeepers.
export async function verifyAsAdmin(browser: Browser, beekeeperEmail: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const email = uniqueEmail();
  await signUp(page, email);
  await expect(page.getByText("Account created.")).toBeVisible();
  promoteToAdmin(email);
  await signIn(page, email);
  await page.getByRole("link", { name: "Verify beekeepers" }).click();
  await page.getByRole("listitem").filter({ hasText: beekeeperEmail }).getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText(beekeeperEmail)).toHaveCount(0);
  await context.close();
}
