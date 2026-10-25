import { z } from "zod";

// Error messages are keys under apiary.errors in messages/*.json; the forms translate them.
const name = z.string("nameRequired").trim().min(1, "nameRequired").max(100, "nameTooLong");

export const createApiarySchema = z.object({
  name,
  location: z.string("locationRequired").trim().min(1, "locationRequired").max(200, "locationTooLong"),
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
});

export type CreateApiaryInput = z.infer<typeof createApiarySchema>;
export type AddHiveInput = z.infer<typeof addHiveSchema>;
