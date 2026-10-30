import { z } from "zod";

// Error messages are keys under apiary.errors in messages/*.json; the forms translate them.
const name = z.string("nameRequired").trim().min(1, "nameRequired").max(100, "nameTooLong");

// The browser uploads photos straight to Vercel Blob; only an address there is accepted, or none.
const photoUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || null)
  .pipe(z.url({ protocol: /^https$/, hostname: /\.public\.blob\.vercel-storage\.com$/, error: "photoInvalid" }).nullable());

export const createApiarySchema = z.object({
  name,
  location: z.string("locationRequired").trim().min(1, "locationRequired").max(200, "locationTooLong"),
  photoUrl,
});

export const addHiveSchema = z.object({
  apiaryId: z.string().min(1),
  name,
  description: z
    .string()
    .trim()
    .max(1000, "descriptionTooLong")
    .optional()
    .transform((value) => value || null),
  photoUrl,
});

export type CreateApiaryInput = z.infer<typeof createApiarySchema>;
export type AddHiveInput = z.infer<typeof addHiveSchema>;
