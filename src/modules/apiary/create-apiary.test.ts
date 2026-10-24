import { beforeEach, describe, expect, it, vi } from "vitest";

const { createApiary, getSession, isVerifiedBeekeeper, revalidatePath } = vi.hoisted(() => ({
  createApiary: vi.fn(),
  getSession: vi.fn(),
  isVerifiedBeekeeper: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("@/shared/db/client", () => ({ prisma: { apiary: { create: createApiary } } }));
vi.mock("@/modules/identity", () => ({ getSession, isVerifiedBeekeeper }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { createApiaryAction } from "./create-apiary.action";

const beekeeper = { user: { id: "user_bee", role: "BEEKEEPER", email: "bee@example.test" } };

function toFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

describe("createApiaryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue(beekeeper);
    isVerifiedBeekeeper.mockResolvedValue(true);
    createApiary.mockResolvedValue({ id: "apiary_1" });
  });

  it("creates the apiary for the signed-in beekeeper, ignoring any ownerId in the form", async () => {
    const state = await createApiaryAction(
      { status: "idle" },
      toFormData({ name: " Linden Hill ", location: " Vorzel, Bucha district ", ownerId: "someone_else" }),
    );

    expect(state).toEqual({ status: "success", apiaryId: "apiary_1" });
    expect(createApiary).toHaveBeenCalledWith({
      data: { ownerId: "user_bee", name: "Linden Hill", location: "Vorzel, Bucha district" },
      select: { id: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/apiaries");
  });

  it("returns translation keys for invalid input and writes nothing", async () => {
    const state = await createApiaryAction({ status: "idle" }, toFormData({ name: "  ", location: "" }));

    expect(state).toEqual({
      status: "error",
      fieldErrors: { name: ["nameRequired"], location: ["locationRequired"] },
    });
    expect(createApiary).not.toHaveBeenCalled();
  });

  it("refuses signed-out users and clients", async () => {
    getSession.mockResolvedValueOnce(null);
    const signedOut = await createApiaryAction({ status: "idle" }, toFormData({ name: "A", location: "B" }));
    getSession.mockResolvedValueOnce({ user: { ...beekeeper.user, role: "CLIENT" } });
    const client = await createApiaryAction({ status: "idle" }, toFormData({ name: "A", location: "B" }));

    expect(signedOut).toEqual({ status: "error", formError: "signInRequired" });
    expect(client).toEqual({ status: "error", formError: "beekeepersOnly" });
    expect(createApiary).not.toHaveBeenCalled();
  });

  it("refuses a beekeeper an admin has not verified yet", async () => {
    isVerifiedBeekeeper.mockResolvedValueOnce(false);

    const state = await createApiaryAction({ status: "idle" }, toFormData({ name: "A", location: "B" }));

    expect(state).toEqual({ status: "error", formError: "verificationPending" });
    expect(isVerifiedBeekeeper).toHaveBeenCalledWith("user_bee");
    expect(createApiary).not.toHaveBeenCalled();
  });
});
