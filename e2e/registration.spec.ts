import { expect, test } from "@playwright/test";
import { signIn, signUp, uniqueEmail } from "./helpers";

test("sign up, sign in, see the session, sign out", async ({ page }) => {
  const email = uniqueEmail();

  await signUp(page, email, "Beekeeper");
  await expect(page.getByText("Account created.")).toBeVisible();

  await signIn(page, email);
  await expect(page).toHaveURL("/");
  await expect(page.getByText(`Signed in as ${email} (Beekeeper)`)).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/sign-in");
  await page.goto("/");
  await expect(page.getByRole("link", { name: "create an account" })).toBeVisible();
});

test("shows an error when the email is already registered", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await expect(page.getByText("Account created.")).toBeVisible();

  await signUp(page, email.toUpperCase());
  await expect(page.getByText("An account with this email already exists.")).toBeVisible();
});

test("shows an error for a wrong password and stays signed out", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await expect(page.getByText("Account created.")).toBeVisible();

  await signIn(page, email, "wrong password");
  await expect(page.getByText("Wrong email or password.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("link", { name: "create an account" })).toBeVisible();
});
