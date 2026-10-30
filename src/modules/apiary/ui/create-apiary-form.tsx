"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { createApiaryAction, type CreateApiaryState } from "../create-apiary.action";
import { Field, FormError } from "./field";
import { PhotoField } from "./photo-field";

const initialState: CreateApiaryState = { status: "idle" };

export function CreateApiaryForm() {
  const t = useTranslations("apiary.create");
  const [state, formAction, pending] = useActionState(createApiaryAction, initialState);
  const [uploading, setUploading] = useState(false);
  const fieldErrors = state.status === "error" && "fieldErrors" in state ? state.fieldErrors : {};

  return (
    <form action={formAction} className="grid gap-4">
      <Field id="apiary-name" label={t("name")} errors={fieldErrors.name}>
        <Input id="apiary-name" name="name" required aria-invalid={!!fieldErrors.name} />
      </Field>
      <Field id="apiary-location" label={t("location")} errors={fieldErrors.location}>
        <Input id="apiary-location" name="location" required aria-invalid={!!fieldErrors.location} />
      </Field>
      {/* A new key after each success clears the photo the previous submit used. */}
      <PhotoField
        key={state.status === "success" ? state.apiaryId : "new"}
        id="apiary-photo"
        errors={fieldErrors.photoUrl}
        onUploadingChange={setUploading}
      />
      <FormError error={state.status === "error" && "formError" in state ? state.formError : undefined} />
      <Button type="submit" disabled={pending || uploading}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
