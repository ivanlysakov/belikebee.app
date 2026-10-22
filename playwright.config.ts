import { defineConfig, devices } from "@playwright/test";
import { TEST_DATABASE_URL } from "./test/test-database.ts";

// E2E runs a production build on its own port against the test database, so it can run next to `pnpm dev`.
const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start --port 3100",
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: false,
    env: { DATABASE_URL: TEST_DATABASE_URL, NEXTAUTH_URL: baseURL },
  },
});
