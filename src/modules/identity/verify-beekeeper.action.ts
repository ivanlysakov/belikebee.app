"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/shared/db/client";
import { getSession } from "./auth";

// Form action for the Verify button on /admin/beekeepers. Verifying twice, or a non-beekeeper, changes nothing.
export async function verifyBeekeeperAction(formData: FormData) {
  const session = await getSession();
  if (session?.user.role !== "ADMIN") throw new Error("Only admins can verify beekeepers");

  const userId = z.string().min(1).parse(formData.get("userId"));
  await prisma.user.updateMany({
    where: { id: userId, role: "BEEKEEPER", beekeeperVerifiedAt: null },
    data: { beekeeperVerifiedAt: new Date() },
  });
  revalidatePath("/admin/beekeepers");
}
