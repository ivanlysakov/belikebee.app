import { beforeEach, describe, expect, it, vi } from "vitest";

const { findApiary, createHive, publish, getSession, isVerifiedBeekeeper, revalidatePath } = vi.hoisted(() => ({
  findApiary: vi.fn(),
  createHive: vi.fn(),
  publish: vi.fn(),
  getSession: vi.fn(),
  isVerifiedBeekeeper: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("@/shared/db/client", () => ({
  prisma: { apiary: { findUnique: findApiary }, hive: { create: createHive } },
}));
vi.mock("@/shared/event-bus", () => ({ publish }));
vi.mock("@/modules/identity", () => ({ getSession, isVerifiedBeekeeper }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { addHiveAction } from "./add-hive.action";

const beekeeper = { user: { id: "user_bee", role: "BEEKEEPER", email: "bee@example.test" } };
const validInput = { apiaryId: "apiary_1", name: " Hive 3 ", description: " Carniolan colony " };

function toFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

describe("addHiveAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue(beekeeper);
    isVerifiedBeekeeper.mockResolvedValue(true);
    findApiary.mockResolvedValue({ ownerId: "user_bee" });
    createHive.mockResolvedValue({ id: "hive_1" });
  });

  it("adds the hive to the beekeeper's own apiary, then publishes HiveAddedToPlatform", async () => {
    const state = await addHiveAction({ status: "idle" }, toFormData(validInput));

    expect(state).toEqual({ status: "success", hiveId: "hive_1" });
    expect(createHive).toHaveBeenCalledWith({
      data: { apiaryId: "apiary_1", name: "Hive 3", description: "Carniolan colony", photoUrl: null },
      select: { id: true },
    });
    expect(publish).toHaveBeenCalledWith({
      type: "HiveAddedToPlatform",
      payload: { hiveId: "hive_1", apiaryId: "apiary_1", ownerId: "user_bee" },
      occurredAt: expect.any(Date),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/apiaries/apiary_1");
  });

  it("stores an empty description as null", async () => {
    await addHiveAction({ status: "idle" }, toFormData({ ...validInput, description: "  " }));

    expect(createHive.mock.calls[0][0].data.description).toBeNull();
  });

  it("saves a Vercel Blob photo address and rejects any other host", async () => {
    const photoUrl = "https://store1.public.blob.vercel-storage.com/linden-abc123.jpg";
    await addHiveAction({ status: "idle" }, toFormData({ ...validInput, photoUrl }));
    const foreign = await addHiveAction(
      { status: "idle" },
      toFormData({ ...validInput, photoUrl: "http://store1.public.blob.vercel-storage.com/photo.jpg" }),
    );

    expect(createHive).toHaveBeenCalledTimes(1);
    expect(createHive.mock.calls[0][0].data.photoUrl).toBe(photoUrl);
    expect(foreign).toEqual({ status: "error", fieldErrors: { photoUrl: ["photoInvalid"] } });
  });

  it("treats another beekeeper's apiary like a missing one: no hive, no event", async () => {
    findApiary.mockResolvedValueOnce({ ownerId: "user_other" });
    const foreign = await addHiveAction({ status: "idle" }, toFormData(validInput));
    findApiary.mockResolvedValueOnce(null);
    const missing = await addHiveAction({ status: "idle" }, toFormData(validInput));

    expect(foreign).toEqual({ status: "error", formError: "apiaryNotFound" });
    expect(missing).toEqual({ status: "error", formError: "apiaryNotFound" });
    expect(createHive).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("returns translation keys for invalid input and writes nothing", async () => {
    const state = await addHiveAction({ status: "idle" }, toFormData({ ...validInput, name: "" }));

    expect(state).toEqual({ status: "error", fieldErrors: { name: ["nameRequired"] } });
    expect(createHive).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("refuses clients", async () => {
    getSession.mockResolvedValueOnce({ user: { ...beekeeper.user, role: "CLIENT" } });

    const state = await addHiveAction({ status: "idle" }, toFormData(validInput));

    expect(state).toEqual({ status: "error", formError: "beekeepersOnly" });
    expect(findApiary).not.toHaveBeenCalled();
    expect(createHive).not.toHaveBeenCalled();
  });
});
