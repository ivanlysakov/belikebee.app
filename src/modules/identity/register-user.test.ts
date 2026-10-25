import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const { createUser, publish } = vi.hoisted(() => ({ createUser: vi.fn(), publish: vi.fn() }));
vi.mock("@/shared/db/client", () => ({ prisma: { user: { create: createUser } } }));
vi.mock("@/shared/event-bus", () => ({ publish }));

import { verifyPassword } from "./password";
import { registerUserAction } from "./register-user.action";
import { registerUserSchema } from "./register-user.schema";

const validInput = {
  email: "  Olena@Example.COM ",
  password: "correct horse battery",
  name: " Olena ",
  role: "BEEKEEPER",
};

function toFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

describe("registerUserSchema", () => {
  it("trims input and lowercases the email", () => {
    expect(registerUserSchema.parse(validInput)).toEqual({
      email: "olena@example.com",
      password: "correct horse battery",
      name: "Olena",
      role: "BEEKEEPER",
    });
  });

  it("does not allow self-registration as ADMIN", () => {
    expect(registerUserSchema.safeParse({ ...validInput, role: "ADMIN" }).success).toBe(false);
  });

  it("rejects an invalid email, a short password and an empty name with translation keys", () => {
    const result = registerUserSchema.safeParse({ ...validInput, email: "nope", password: "short", name: "  " });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => [issue.path[0], issue.message])).toEqual([
      ["email", "emailInvalid"],
      ["password", "passwordTooShort"],
      ["name", "nameRequired"],
    ]);
  });
});

describe("registerUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createUser.mockResolvedValue({ id: "user_1", role: "BEEKEEPER" });
  });

  it("creates the user with a hashed password and a profile, then publishes UserRegistered", async () => {
    const state = await registerUserAction({ status: "idle" }, toFormData(validInput));

    expect(state).toEqual({ status: "success", userId: "user_1" });
    const { data } = createUser.mock.calls[0][0];
    expect(data).toMatchObject({ email: "olena@example.com", role: "BEEKEEPER", profile: { create: { name: "Olena" } } });
    expect(data.passwordHash).not.toContain(validInput.password);
    await expect(verifyPassword(validInput.password, data.passwordHash)).resolves.toBe(true);
    expect(publish).toHaveBeenCalledWith({
      type: "UserRegistered",
      payload: { userId: "user_1", role: "BEEKEEPER" },
      occurredAt: expect.any(Date),
    });
  });

  it("returns field errors and writes nothing when input is invalid", async () => {
    const state = await registerUserAction({ status: "idle" }, toFormData({ ...validInput, email: "nope" }));

    expect(state).toEqual({ status: "error", fieldErrors: { email: ["emailInvalid"] } });
    expect(createUser).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("reports an already registered email without publishing", async () => {
    createUser.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "7.10.1" }),
    );

    const state = await registerUserAction({ status: "idle" }, toFormData(validInput));

    expect(state).toEqual({ status: "error", fieldErrors: { email: ["emailTaken"] } });
    expect(publish).not.toHaveBeenCalled();
  });
});
