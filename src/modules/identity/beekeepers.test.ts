import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, updateMany, getSession, revalidatePath } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  getSession: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("@/shared/db/client", () => ({ prisma: { user: { findUnique, updateMany } } }));
vi.mock("./auth", () => ({ getSession }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { isVerifiedBeekeeper, promoteToAdmin } from "./beekeepers";
import { verifyBeekeeperAction } from "./verify-beekeeper.action";

function userIdForm(userId: string) {
  const formData = new FormData();
  formData.set("userId", userId);
  return formData;
}

describe("isVerifiedBeekeeper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is true only for a beekeeper an admin has verified", async () => {
    findUnique.mockResolvedValueOnce({ role: "BEEKEEPER", beekeeperVerifiedAt: new Date() });
    findUnique.mockResolvedValueOnce({ role: "BEEKEEPER", beekeeperVerifiedAt: null });
    findUnique.mockResolvedValueOnce(null);

    await expect(isVerifiedBeekeeper("user_verified")).resolves.toBe(true);
    await expect(isVerifiedBeekeeper("user_waiting")).resolves.toBe(false);
    await expect(isVerifiedBeekeeper("user_missing")).resolves.toBe(false);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user_verified" },
      select: { role: true, beekeeperVerifiedAt: true },
    });
  });
});

describe("promoteToAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("finds the user by normalized email and reports whether one was promoted", async () => {
    updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

    await expect(promoteToAdmin(" Admin@Example.TEST ")).resolves.toBe(true);
    await expect(promoteToAdmin("nobody@example.test")).resolves.toBe(false);
    expect(updateMany).toHaveBeenCalledWith({ where: { email: "admin@example.test" }, data: { role: "ADMIN" } });
  });
});

describe("verifyBeekeeperAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMany.mockResolvedValue({ count: 1 });
  });

  it("lets an admin verify a beekeeper who is still waiting", async () => {
    getSession.mockResolvedValue({ user: { id: "user_admin", role: "ADMIN" } });

    await verifyBeekeeperAction(userIdForm("user_bee"));

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "user_bee", role: "BEEKEEPER", beekeeperVerifiedAt: null },
      data: { beekeeperVerifiedAt: expect.any(Date) },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/beekeepers");
  });

  it("refuses everyone but admins and writes nothing", async () => {
    getSession.mockResolvedValueOnce(null);
    await expect(verifyBeekeeperAction(userIdForm("user_bee"))).rejects.toThrow("Only admins");
    getSession.mockResolvedValueOnce({ user: { id: "user_bee", role: "BEEKEEPER" } });
    await expect(verifyBeekeeperAction(userIdForm("user_bee"))).rejects.toThrow("Only admins");

    expect(updateMany).not.toHaveBeenCalled();
  });
});
