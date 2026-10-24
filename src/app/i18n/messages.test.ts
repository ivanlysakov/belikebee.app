import { describe, expect, it } from "vitest";
import { messages } from "./messages";

// "a.b.c" for every leaf string, so a key missing in one language shows up by name.
function keyPaths(tree: object, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "object" && value !== null ? keyPaths(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

describe("messages", () => {
  it("has the same keys in Ukrainian and English", () => {
    expect(keyPaths(messages.uk).sort()).toEqual(keyPaths(messages.en).sort());
  });

  it("includes every module's namespace", () => {
    expect(Object.keys(messages.uk).sort()).toEqual(["app", "identity"]);
  });
});
