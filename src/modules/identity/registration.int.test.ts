import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/shared/db/client";
import { subscribe } from "@/shared/event-bus";
import type { UserRegistered } from "@/shared/events";
import { verifyPassword } from "./password";
import { registerUserAction } from "./register-user.action";
import { authorizeCredentials } from "./sign-in";

// Runs against the real belikebee_test database (see test/test-database.ts); no mocks.
const password = "correct horse battery";
const published: UserRegistered[] = [];
subscribe("UserRegistered", (event) => {
  published.push(event);
});

function register(email: string, role = "CLIENT") {
  const formData = new FormData();
  for (const [key, value] of Object.entries({ email, password, name: "Olena", role })) formData.set(key, value);
  return registerUserAction({ status: "idle" }, formData);
}

afterAll(() => prisma.$disconnect());

describe("registration against PostgreSQL", () => {
  it("stores the user with a hashed password and a profile, and publishes UserRegistered", async () => {
    const state = await register("Stored@Example.test", "BEEKEEPER");

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "stored@example.test" },
      include: { profile: true },
    });
    expect(state).toEqual({ status: "success", userId: user.id });
    expect(user).toMatchObject({ role: "BEEKEEPER", profile: { name: "Olena" } });
    await expect(verifyPassword(password, user.passwordHash)).resolves.toBe(true);
    expect(published).toContainEqual(expect.objectContaining({ payload: { userId: user.id, role: "BEEKEEPER" } }));
  });

  it("rejects an email that is already registered, even in different case, and keeps one user", async () => {
    await register("taken@example.test");
    const state = await register("TAKEN@example.test");

    expect(state).toEqual({ status: "error", fieldErrors: { email: ["An account with this email already exists."] } });
    await expect(prisma.user.count({ where: { email: "taken@example.test" } })).resolves.toBe(1);
  });

  it("signs in a registered user only with the right password", async () => {
    await register("sign-in@example.test");

    await expect(authorizeCredentials({ email: "sign-in@example.test", password })).resolves.toMatchObject({
      email: "sign-in@example.test",
      role: "CLIENT",
    });
    await expect(authorizeCredentials({ email: "sign-in@example.test", password: "wrong password" })).resolves.toBeNull();
  });
});
