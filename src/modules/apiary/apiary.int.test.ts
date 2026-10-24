import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Only the session and Next's cache are faked; Prisma, Postgres and the event bus are real.
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/modules/identity", () => ({ getSession }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import type { DomainEvent } from "@/shared/events";
import { prisma } from "@/shared/db/client";
import { subscribe } from "@/shared/event-bus";
import { addHiveAction } from "./add-hive.action";
import { getApiary, listApiaries } from "./apiaries";
import { createApiaryAction } from "./create-apiary.action";

const events: DomainEvent[] = [];
subscribe("HiveAddedToPlatform", (event) => {
  events.push(event);
});

function signInAs(id: string) {
  getSession.mockResolvedValue({ user: { id, role: "BEEKEEPER", email: `${id}@example.test` } });
}

function toFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

async function createApiary(name: string) {
  const state = await createApiaryAction({ status: "idle" }, toFormData({ name, location: "Vorzel" }));
  if (state.status !== "success") throw new Error(`createApiary failed: ${JSON.stringify(state)}`);
  return state.apiaryId;
}

describe("apiaries and hives against PostgreSQL", () => {
  beforeEach(() => {
    events.length = 0;
  });
  afterAll(() => prisma.$disconnect());

  it("stores the apiary and hive for their owner and publishes HiveAddedToPlatform", async () => {
    signInAs("bee_owner");
    const apiaryId = await createApiary("Linden Hill");

    const state = await addHiveAction({ status: "idle" }, toFormData({ apiaryId, name: "Hive 1", description: "" }));

    expect(state.status).toBe("success");
    const hive = await prisma.hive.findFirstOrThrow({ where: { apiaryId } });
    expect(hive).toMatchObject({ name: "Hive 1", description: null });
    await expect(prisma.apiary.findUniqueOrThrow({ where: { id: apiaryId } })).resolves.toMatchObject({
      ownerId: "bee_owner",
      location: "Vorzel",
    });
    expect(events).toEqual([
      {
        type: "HiveAddedToPlatform",
        payload: { hiveId: hive.id, apiaryId, ownerId: "bee_owner" },
        occurredAt: expect.any(Date),
      },
    ]);
  });

  it("keeps each beekeeper to their own apiaries", async () => {
    signInAs("bee_a");
    const apiaryA = await createApiary("A's apiary");
    signInAs("bee_b");

    const state = await addHiveAction({ status: "idle" }, toFormData({ apiaryId: apiaryA, name: "Intruder" }));

    expect(state).toEqual({ status: "error", formError: "apiaryNotFound" });
    await expect(prisma.hive.count({ where: { apiaryId: apiaryA } })).resolves.toBe(0);
    expect(events).toEqual([]);
    await expect(getApiary("bee_b", apiaryA)).resolves.toBeNull();
    await expect(listApiaries("bee_b")).resolves.toEqual([]);
    await expect(listApiaries("bee_a")).resolves.toEqual([
      { id: apiaryA, name: "A's apiary", location: "Vorzel", _count: { hives: 0 } },
    ]);
  });

  it("deletes an apiary's hives with it (migration cascade)", async () => {
    signInAs("bee_cascade");
    const apiaryId = await createApiary("Short-lived");
    await addHiveAction({ status: "idle" }, toFormData({ apiaryId, name: "Hive 1" }));

    await prisma.apiary.delete({ where: { id: apiaryId } });

    await expect(prisma.hive.count({ where: { apiaryId } })).resolves.toBe(0);
  });
});
