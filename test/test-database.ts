import { execFileSync } from "node:child_process";

// Separate database on the dev Postgres container (see .devcontainer/docker-compose.yaml), so tests never touch dev data.
export const TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/belikebee_test";

// Brings the test database to the latest migration and empties it. A shell DATABASE_URL wins over .env.
export function resetTestDatabase() {
  const options = { env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }, stdio: "pipe" as const };
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], options);
  execFileSync("pnpm", ["exec", "prisma", "db", "execute", "--stdin"], { ...options, input: 'TRUNCATE "User" CASCADE;' });
}
