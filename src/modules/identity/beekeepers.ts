import { prisma } from "@/shared/db/client";
import { registerUserSchema } from "./register-user.schema";

// Read on every apiary action instead of trusting the session, so a verification counts at once.
export async function isVerifiedBeekeeper(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, beekeeperVerifiedAt: true },
  });
  return user?.role === "BEEKEEPER" && user.beekeeperVerifiedAt !== null;
}

export type UnverifiedBeekeeper = Awaited<ReturnType<typeof listUnverifiedBeekeepers>>[number];

export function listUnverifiedBeekeepers() {
  return prisma.user.findMany({
    where: { role: "BEEKEEPER", beekeeperVerifiedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, profile: { select: { name: true } } },
  });
}

// For `pnpm admin:promote <email>` (promote-admin.cli.ts); false when no user has that email.
export async function promoteToAdmin(email: string) {
  const { count } = await prisma.user.updateMany({
    where: { email: registerUserSchema.shape.email.parse(email) },
    data: { role: "ADMIN" },
  });
  return count === 1;
}
