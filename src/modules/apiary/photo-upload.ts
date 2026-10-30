import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/shared/db/client";
import { currentBeekeeper } from "./access";

class UploadRefused extends Error {}

// Asked before Vercel Blob signs an upload token: only a verified beekeeper uploads,
// and a hive photo (clientPayload {"apiaryId": …}) only into their own apiary.
async function photoUploadOptions(clientPayload: string | null) {
  const access = await currentBeekeeper();
  if (access.status === "error") throw new UploadRefused(access.formError);

  const apiaryId = clientPayload ? (JSON.parse(clientPayload) as { apiaryId?: string }).apiaryId : undefined;
  if (apiaryId) {
    const apiary = await prisma.apiary.findUnique({ where: { id: apiaryId }, select: { ownerId: true } });
    if (apiary?.ownerId !== access.userId) throw new UploadRefused("apiaryNotFound");
  }

  return {
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    maximumSizeInBytes: 5 * 1024 * 1024,
    addRandomSuffix: true,
  };
}

// POST /api/apiary/upload: the browser's upload() asks here for a token, then sends the file to Blob itself.
export async function handlePhotoUpload(request: Request) {
  try {
    const result = await handleUpload({
      request,
      body: (await request.json()) as HandleUploadBody,
      onBeforeGenerateToken: (_pathname, clientPayload) => photoUploadOptions(clientPayload),
    });
    return Response.json(result);
  } catch (error) {
    if (error instanceof UploadRefused) return Response.json({ error: error.message }, { status: 403 });
    throw error;
  }
}
