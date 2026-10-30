"use server";

import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/db/client";
import { publish } from "@/shared/event-bus";
import { hashPassword } from "./password";
import { registerUserSchema, type RegisterUserInput } from "./register-user.schema";

export type RegisterUserState =
  | { status: "idle" }
  | { status: "success"; userId: string }
  | { status: "error"; fieldErrors: Partial<Record<keyof RegisterUserInput, string[]>> };

// Shaped for React's useActionState: (previous state, form data) => next state.
export async function registerUserAction(_prev: RegisterUserState, formData: FormData): Promise<RegisterUserState> {
  const parsed = registerUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const { email, password, name, role } = parsed.data;
  let userId: string;
  try {
    const user = await prisma.user.create({
      data: { email, role, passwordHash: await hashPassword(password), profile: { create: { name } } },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    // P2002: unique constraint violation; the only one a new user can hit is User.email.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", fieldErrors: { email: ["emailTaken"] } };
    }
    throw error;
  }

  await publish({ type: "UserRegistered", payload: { userId, role }, occurredAt: new Date() });
  return { status: "success", userId };
}
