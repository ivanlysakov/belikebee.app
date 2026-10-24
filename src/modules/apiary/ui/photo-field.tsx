"use client";

import { upload } from "@vercel/blob/client";
import { useTranslations } from "next-intl";
import { useState, type ChangeEvent } from "react";
import { Input } from "@/shared/ui/input";
import { Field } from "./field";

type Props = {
  id: string;
  errors?: string[];
  // Set for a hive photo, so the upload route can check the apiary belongs to the beekeeper.
  apiaryId?: string;
  onUploadingChange: (uploading: boolean) => void;
};

// The file goes from the browser straight to Vercel Blob; the form submits only its address (hidden photoUrl).
export function PhotoField({ id, errors, apiaryId, onUploadingChange }: Props) {
  const t = useTranslations("apiary.photo");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "failed">("idle");

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUrl("");
    if (!file) return;

    setStatus("uploading");
    onUploadingChange(true);
    // upload() silently retries what the browser reports as network errors (including Blob rejections
    // hidden by CORS) for many minutes; cancel it after 60 s so the form shows "failed". It must be
    // controller.abort(): the library stops only on an AbortError, and AbortSignal.timeout() gives a TimeoutError.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/apiary/upload",
        clientPayload: apiaryId ? JSON.stringify({ apiaryId }) : undefined,
        abortSignal: controller.signal,
      });
      setUrl(blob.url);
      setStatus("idle");
    } catch {
      setStatus("failed");
    } finally {
      clearTimeout(timer);
      onUploadingChange(false);
    }
  }

  return (
    <Field id={id} label={t("label")} errors={errors}>
      <Input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} />
      <input type="hidden" name="photoUrl" value={url} />
      {status === "uploading" && <p className="text-sm text-muted-foreground">{t("uploading")}</p>}
      {status === "failed" && <p className="text-sm text-destructive">{t("failed")}</p>}
    </Field>
  );
}
