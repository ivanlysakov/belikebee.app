import { beforeEach, describe, expect, it, vi } from "vitest";

const { handleUpload, findApiary, getSession, isVerifiedBeekeeper } = vi.hoisted(() => ({
  handleUpload: vi.fn(),
  findApiary: vi.fn(),
  getSession: vi.fn(),
  isVerifiedBeekeeper: vi.fn(),
}));
vi.mock("@vercel/blob/client", () => ({ handleUpload }));
vi.mock("@/shared/db/client", () => ({ prisma: { apiary: { findUnique: findApiary } } }));
vi.mock("@/modules/identity", () => ({ getSession, isVerifiedBeekeeper }));

import { handlePhotoUpload } from "./photo-upload";

const beekeeper = { user: { id: "user_bee", role: "BEEKEEPER", email: "bee@example.test" } };

// Like the real handleUpload: ask onBeforeGenerateToken first, and sign a token only if it returns.
let tokenOptions: unknown;
handleUpload.mockImplementation(async ({ body, onBeforeGenerateToken }) => {
  tokenOptions = await onBeforeGenerateToken(body.payload.pathname, body.payload.clientPayload, false);
  return { type: "blob.generate-client-token", clientToken: "client_token" };
});

function tokenRequest(clientPayload: string | null) {
  const body = { type: "blob.generate-client-token", payload: { pathname: "photo.jpg", clientPayload, multipart: false } };
  return new Request("http://localhost/api/apiary/upload", { method: "POST", body: JSON.stringify(body) });
}

describe("handlePhotoUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenOptions = undefined;
    getSession.mockResolvedValue(beekeeper);
    isVerifiedBeekeeper.mockResolvedValue(true);
    findApiary.mockResolvedValue({ ownerId: "user_bee" });
  });

  it("gives a verified beekeeper a token for images up to 5 MB", async () => {
    const response = await handlePhotoUpload(tokenRequest(null));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ type: "blob.generate-client-token", clientToken: "client_token" });
    expect(tokenOptions).toEqual({
      allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
      maximumSizeInBytes: 5 * 1024 * 1024,
      addRandomSuffix: true,
    });
  });

  it("allows a hive photo for the beekeeper's own apiary", async () => {
    const response = await handlePhotoUpload(tokenRequest(JSON.stringify({ apiaryId: "apiary_1" })));

    expect(response.status).toBe(200);
    expect(findApiary).toHaveBeenCalledWith({ where: { id: "apiary_1" }, select: { ownerId: true } });
  });

  it("refuses clients, signed-out users and unverified beekeepers", async () => {
    getSession.mockResolvedValueOnce({ user: { ...beekeeper.user, role: "CLIENT" } });
    const client = await handlePhotoUpload(tokenRequest(null));
    getSession.mockResolvedValueOnce(null);
    const signedOut = await handlePhotoUpload(tokenRequest(null));
    isVerifiedBeekeeper.mockResolvedValueOnce(false);
    const unverified = await handlePhotoUpload(tokenRequest(null));

    expect([client.status, signedOut.status, unverified.status]).toEqual([403, 403, 403]);
    expect(tokenOptions).toBeUndefined();
  });

  it("refuses a hive photo for another beekeeper's apiary", async () => {
    findApiary.mockResolvedValueOnce({ ownerId: "someone_else" });

    const response = await handlePhotoUpload(tokenRequest(JSON.stringify({ apiaryId: "apiary_1" })));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "apiaryNotFound" });
    expect(tokenOptions).toBeUndefined();
  });
});
