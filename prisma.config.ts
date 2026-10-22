import { defineConfig } from "prisma/config";

// Prisma 7 no longer reads .env itself. Next.js loads it for the app; this covers the Prisma CLI.
// Without a readable .env (CI, sandbox), variables come from the shell environment.
try {
  process.loadEnvFile();
} catch {}

// Multi-file schema: every module keeps its models in src/modules/<name>/<name>.prisma.
// The datasource and generator live in src/shared/db/schema.prisma.
export default defineConfig({
  schema: "src",
  migrations: {
    path: "src/shared/db/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
