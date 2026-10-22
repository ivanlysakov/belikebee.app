"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { registerUserAction, type RegisterUserState } from "../register-user.action";

const initialState: RegisterUserState = { status: "idle" };

function Field({ id, label, errors, children }: { id: string; label: string; errors?: string[]; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {errors?.map((error) => (
        <p key={error} className="text-sm text-destructive">
          {error}
        </p>
      ))}
    </div>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(registerUserAction, initialState);

  if (state.status === "success") {
    return (
      <p>
        Account created.{" "}
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form action={formAction} className="grid gap-4">
      <Field id="name" label="Name" errors={errors.name}>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={!!errors.name} />
      </Field>
      <Field id="email" label="Email" errors={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
      </Field>
      <Field id="password" label="Password" errors={errors.password}>
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
        <legend className="mb-2 text-sm font-medium">I am a</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="CLIENT" defaultChecked /> Client: I want to rent a hive
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="BEEKEEPER" /> Beekeeper: I run an apiary
        </label>
        {errors.role?.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
