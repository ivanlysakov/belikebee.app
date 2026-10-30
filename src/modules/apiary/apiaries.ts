import { prisma } from "@/shared/db/client";

// Reads are always scoped to the owner, so a beekeeper never sees another beekeeper's apiaries.
export function listApiaries(ownerId: string) {
  return prisma.apiary.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, location: true, photoUrl: true, _count: { select: { hives: true } } },
  });
}

export function getApiary(ownerId: string, apiaryId: string) {
  return prisma.apiary.findFirst({
    where: { id: apiaryId, ownerId },
    select: {
      id: true,
      name: true,
      location: true,
      hives: { orderBy: { createdAt: "asc" }, select: { id: true, name: true, description: true, photoUrl: true } },
    },
  });
}

export type ApiarySummary = Awaited<ReturnType<typeof listApiaries>>[number];
export type HiveSummary = NonNullable<Awaited<ReturnType<typeof getApiary>>>["hives"][number];

// Public: anyone may browse every hive, so nothing about the owner is selected.
export function listPublicHives() {
  return prisma.hive.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      photoUrl: true,
      apiary: { select: { name: true, location: true } },
    },
  });
}

export type PublicHive = Awaited<ReturnType<typeof listPublicHives>>[number];

export type PublicHiveProfile = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  apiary: { name: string; location: string; hiveCount: number };
};

// Public, like listPublicHives: the apiary is named, its owner is not.
export async function getPublicHive(id: string): Promise<PublicHiveProfile | null> {
  const hive = await prisma.hive.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      photoUrl: true,
      apiary: { select: { name: true, location: true, _count: { select: { hives: true } } } },
    },
  });
  if (!hive) return null;
  const { _count, ...apiary } = hive.apiary;
  return { ...hive, apiary: { ...apiary, hiveCount: _count.hives } };
}
