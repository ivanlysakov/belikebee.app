"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/shared/db/client";
import { currentBeekeeper, type BeekeeperAccess } from "./access";
import { createApiarySchema, type CreateApiaryInput } from "./apiary.schema";

export type CreateApiaryState =
  | { status: "idle" }
  | { status: "success"; apiaryId: string }
  | Extract<BeekeeperAccess, { status: "error" }>
  | { status: "error"; fieldErrors: Partial<Record<keyof CreateApiaryInput, string[]>> };

// Shaped for React's useActionState: (previous state, form data) => next state.
export async function createApiaryAction(_prev: CreateApiaryState, formData: FormData): Promise<CreateApiaryState> {
  const access = await currentBeekeeper();
  if (access.status === "error") return access;

  const parsed = createApiarySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  // The owner always comes from the session, never from the form.
  const apiary = await prisma.apiary.create({
    data: { ...parsed.data, ownerId: access.userId },
    select: { id: true },
  });

  revalidatePath("/apiaries");
  return { status: "success", apiaryId: apiary.id };
}
