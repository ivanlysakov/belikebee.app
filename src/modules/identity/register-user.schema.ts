import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

// Error messages are keys under identity.errors in messages/*.json; the form translates them.
export const registerUserSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("emailInvalid")),
  password: z.string().min(8, "passwordTooShort").max(128, "passwordTooLong"),
  name: z.string().trim().min(1, "nameRequired").max(100, "nameTooLong"),
  // ADMIN is granted by an operator, never chosen at sign-up.
  role: z.enum([Role.CLIENT, Role.BEEKEEPER], "roleInvalid"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
