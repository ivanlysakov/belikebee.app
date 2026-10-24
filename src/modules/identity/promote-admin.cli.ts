// Makes an existing user an admin: `pnpm admin:promote <email>`. A DATABASE_URL in the shell wins over .env.
// Imports ./beekeepers, not index.ts: the public API also loads NextAuth, which only runs inside Next.js.
import { prisma } from "@/shared/db/client";
import { promoteToAdmin } from "./beekeepers";

const email = process.argv[2];
if (!email) {
  console.error("Usage: pnpm admin:promote <email>");
  process.exit(1);
}

if (await promoteToAdmin(email)) {
  console.log(`${email} is now an admin. They need to sign out and sign in again.`);
} else {
  console.error(`No user with email ${email}.`);
  process.exitCode = 1;
}
await prisma.$disconnect();
