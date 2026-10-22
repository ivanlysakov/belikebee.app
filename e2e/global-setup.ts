import { resetTestDatabase } from "../test/test-database.ts";

export default function globalSetup() {
  resetTestDatabase();
}
