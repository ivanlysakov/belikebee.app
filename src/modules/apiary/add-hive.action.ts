"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/shared/db/client";
import { publish } from "@/shared/event-bus";
import { currentBeekeeper, type BeekeeperAccess } from "./access";
import { addHiveSchema, type AddHiveInput } from "./apiary.schema";

export type AddHiveState =
  | { status: "idle" }
  | { status: "success"; hiveId: string }
  | Extract<BeekeeperAccess, { status: "error" }>
  | { status: "error"; formError: "apiaryNotFound" }
  | { status: "error"; fieldErrors: Partial<Record<keyof AddHiveInput, string[]>> };

// Shaped for React's useActionState: (previous state, form data) => next state.
export async function addHiveAction(_prev: AddHiveState, formData: FormData): Promise<AddHiveState> {
  const access = await currentBeekeeper();
  if (access.status === "error") return access;

  const parsed = addHiveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { apiaryId, name, description, photoUrl } = parsed.data;

  // Another beekeeper's apiary answers exactly like a missing one, so apiary ids can't be probed.
  const apiary = await prisma.apiary.findUnique({ where: { id: apiaryId }, select: { ownerId: true } });
  if (!apiary || apiary.ownerId !== access.userId) return { status: "error", formError: "apiaryNotFound" };

  const hive = await prisma.hive.create({ data: { apiaryId, name, description, photoUrl }, select: { id: true } });

  await publish({
    type: "HiveAddedToPlatform",
    payload: { hiveId: hive.id, apiaryId, ownerId: access.userId },
    occurredAt: new Date(),
  });
  revalidatePath(`/apiaries/${apiaryId}`);
  return { status: "success", hiveId: hive.id };
}
