"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { registerUserAction, type RegisterUserState } from "../register-user.action";

const initialState: RegisterUserState = { status: "idle" };
// The action returns keys of identity.errors (see register-user.schema.ts).
type ErrorKey = Parameters<ReturnType<typeof useTranslations<"identity.errors">>>[0];

function Field({ id, label, errors, children }: { id: string; label: string; errors?: string[]; children: ReactNode }) {
  const tErrors = useTranslations("identity.errors");
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {errors?.map((error) => (
        <p key={error} className="text-sm text-destructive">
          {tErrors(error as ErrorKey)}
        </p>
      ))}
    </div>
  );
}

export function SignUpForm() {
  const t = useTranslations("identity.signUp");
  const tErrors = useTranslations("identity.errors");
  const [state, formAction, pending] = useActionState(registerUserAction, initialState);

  if (state.status === "success") {
    return (
      <p>
        {t("success")}{" "}
        <Link href="/sign-in" className="underline">
          {t("signInLink")}
        </Link>
      </p>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form action={formAction} className="grid gap-4">
      <Field id="name" label={t("name")} errors={errors.name}>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={!!errors.name} />
      </Field>
      <Field id="email" label={t("email")} errors={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
      </Field>
      <Field id="password" label={t("password")} errors={errors.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={!!errors.password}
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">{t("roleLegend")}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="CLIENT" defaultChecked /> {t("roleClient")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="BEEKEEPER" /> {t("roleBeekeeper")}
        </label>
        {errors.role?.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {tErrors(error as ErrorKey)}
          </p>
        ))}
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
