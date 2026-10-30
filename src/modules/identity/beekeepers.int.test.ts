import { afterAll, describe, expect, it, vi } from "vitest";

// Only the session and Next's cache are faked; Prisma and Postgres are real.
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("./auth", () => ({ getSession }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/shared/db/client";
import { isVerifiedBeekeeper, listUnverifiedBeekeepers, promoteToAdmin } from "./beekeepers";
import { verifyBeekeeperAction } from "./verify-beekeeper.action";

function createUser(email: string, role: Role) {
  return prisma.user.create({
    data: { email, role, passwordHash: "not-used", profile: { create: { name: email } } },
    select: { id: true },
  });
}

function userIdForm(userId: string) {
  const formData = new FormData();
  formData.set("userId", userId);
  return formData;
}

describe("beekeeper verification against PostgreSQL", () => {
  afterAll(() => prisma.$disconnect());

  it("an admin verifies a waiting beekeeper; clients are never verified", async () => {
    const beekeeper = await createUser("waiting-bee@example.test", "BEEKEEPER");
    const client = await createUser("client@example.test", "CLIENT");
    await expect(isVerifiedBeekeeper(beekeeper.id)).resolves.toBe(false);
    expect((await listUnverifiedBeekeepers()).map((user) => user.email)).toContain("waiting-bee@example.test");

    getSession.mockResolvedValue({ user: { id: "admin", role: "ADMIN" } });
    await verifyBeekeeperAction(userIdForm(beekeeper.id));
    await verifyBeekeeperAction(userIdForm(client.id));

    await expect(isVerifiedBeekeeper(beekeeper.id)).resolves.toBe(true);
    expect((await listUnverifiedBeekeepers()).map((user) => user.email)).not.toContain("waiting-bee@example.test");
    await expect(prisma.user.findUniqueOrThrow({ where: { id: client.id } })).resolves.toMatchObject({
      role: "CLIENT",
      beekeeperVerifiedAt: null,
    });
  });

  it("promotes an existing user to admin by email", async () => {
    const user = await createUser("future-admin@example.test", "CLIENT");

    await expect(promoteToAdmin("Future-Admin@example.test")).resolves.toBe(true);
    await expect(promoteToAdmin("nobody@example.test")).resolves.toBe(false);

    await expect(prisma.user.findUniqueOrThrow({ where: { id: user.id } })).resolves.toMatchObject({ role: "ADMIN" });
  });
});
