import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { findUser } = vi.hoisted(() => ({ findUser: vi.fn() }));
vi.mock("@/shared/db/client", () => ({ prisma: { user: { findUnique: findUser } } }));

import { hashPassword } from "./password";
import { authorizeCredentials } from "./sign-in";

const password = "correct horse battery";
let storedUser: { id: string; email: string; role: string; passwordHash: string };

beforeAll(async () => {
  storedUser = { id: "user_1", email: "olena@example.com", role: "BEEKEEPER", passwordHash: await hashPassword(password) };
});

beforeEach(() => {
  vi.clearAllMocks();
  findUser.mockResolvedValue(storedUser);
});

describe("authorizeCredentials", () => {
  it("returns the user, without the password hash, for the right password", async () => {
    await expect(authorizeCredentials({ email: " Olena@Example.com ", password })).resolves.toEqual({
      id: "user_1",
      email: "olena@example.com",
      role: "BEEKEEPER",
    });
    expect(findUser).toHaveBeenCalledWith(expect.objectContaining({ where: { email: "olena@example.com" } }));
  });

  it("rejects a wrong password", async () => {
    await expect(authorizeCredentials({ email: "olena@example.com", password: "wrong password" })).resolves.toBeNull();
  });

  it("rejects an unknown email", async () => {
    findUser.mockResolvedValue(null);
    await expect(authorizeCredentials({ email: "nobody@example.com", password })).resolves.toBeNull();
  });

  it("rejects malformed credentials without querying the database", async () => {
    await expect(authorizeCredentials({ email: "nope", password: "" })).resolves.toBeNull();
    await expect(authorizeCredentials(undefined)).resolves.toBeNull();
    expect(findUser).not.toHaveBeenCalled();
  });
});
