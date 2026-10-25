import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";

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
