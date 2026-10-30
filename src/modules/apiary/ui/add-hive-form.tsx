"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { addHiveAction, type AddHiveState } from "../add-hive.action";
import { Field, FormError } from "./field";
import { PhotoField } from "./photo-field";

const initialState: AddHiveState = { status: "idle" };

export function AddHiveForm({ apiaryId }: { apiaryId: string }) {
  const t = useTranslations("apiary.addHive");
  const [state, formAction, pending] = useActionState(addHiveAction, initialState);
  const [uploading, setUploading] = useState(false);
  const fieldErrors = state.status === "error" && "fieldErrors" in state ? state.fieldErrors : {};

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="apiaryId" value={apiaryId} />
      <Field id="hive-name" label={t("name")} errors={fieldErrors.name}>
        <Input id="hive-name" name="name" required aria-invalid={!!fieldErrors.name} />
      </Field>
      <Field id="hive-description" label={t("description")} errors={fieldErrors.description}>
        <Input id="hive-description" name="description" aria-invalid={!!fieldErrors.description} />
      </Field>
      {/* A new key after each success clears the photo the previous submit used. */}
      <PhotoField
        key={state.status === "success" ? state.hiveId : "new"}
        id="hive-photo"
        errors={fieldErrors.photoUrl}
        apiaryId={apiaryId}
        onUploadingChange={setUploading}
      />
      <FormError error={state.status === "error" && "formError" in state ? state.formError : undefined} />
      <Button type="submit" disabled={pending || uploading}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
