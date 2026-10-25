import { execFileSync } from "node:child_process";

// Separate database on the dev Postgres container (see .devcontainer/docker-compose.yaml), so tests never touch dev data.
export const TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/belikebee_test";

// Empties every table except Prisma's migration history, so tables added by any module are cleared too.
const TRUNCATE_ALL_TABLES = `DO $$
DECLARE tables text;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') INTO tables
  FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations';
  IF tables IS NOT NULL THEN EXECUTE 'TRUNCATE ' || tables || ' CASCADE'; END IF;
END $$;`;

// Brings the test database to the latest migration and empties it. A shell DATABASE_URL wins over .env.
export function resetTestDatabase() {
  const options = { env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }, stdio: "pipe" as const };
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], options);
  execFileSync("pnpm", ["exec", "prisma", "db", "execute", "--stdin"], { ...options, input: TRUNCATE_ALL_TABLES });
}
