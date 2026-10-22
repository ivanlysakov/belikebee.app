import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

export const registerUserSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(100),
  // ADMIN is granted by an operator, never chosen at sign-up.
  role: z.enum([Role.CLIENT, Role.BEEKEEPER]),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
