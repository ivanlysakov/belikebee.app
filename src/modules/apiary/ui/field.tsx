"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Label } from "@/shared/ui/label";

// The actions return keys of apiary.errors (see apiary.schema.ts and access.ts).
export type ErrorKey = Parameters<ReturnType<typeof useTranslations<"apiary.errors">>>[0];

export function FormError({ error }: { error?: string }) {
  const t = useTranslations("apiary.errors");
  return error ? <p className="text-sm text-destructive">{t(error as ErrorKey)}</p> : null;
}

export function Field({ id, label, errors, children }: { id: string; label: string; errors?: string[]; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {errors?.map((error) => <FormError key={error} error={error} />)}
    </div>
  );
}
