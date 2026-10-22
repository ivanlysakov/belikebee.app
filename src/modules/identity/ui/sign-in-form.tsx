"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function SignInForm() {
  const router = useRouter();
  const [error, formAction, pending] = useActionState(async (_prev: string | null, formData: FormData) => {
    // NextAuth answers 200 even for bad credentials, so check `error`, not `ok`.
    const result = await signIn("credentials", { ...Object.fromEntries(formData), redirect: false });
    if (!result || result.error) return "Wrong email or password.";
    router.replace("/");
    router.refresh();
    return null;
  }, null);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
