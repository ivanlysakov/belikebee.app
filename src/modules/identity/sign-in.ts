import { z } from "zod";
import { prisma } from "@/shared/db/client";
import { verifyPassword } from "./password";
import { registerUserSchema } from "./register-user.schema";

const signInSchema = z.object({
  email: registerUserSchema.shape.email,
  password: z.string().min(1),
});

// NextAuth Credentials `authorize`: the signed-in user, or null for any wrong or malformed credentials.
export async function authorizeCredentials(credentials: unknown) {
  const parsed = signInSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, role: true, passwordHash: true },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return null;

  return { id: user.id, email: user.email, role: user.role };
}
