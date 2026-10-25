"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";

export function SignOutButton() {
  const t = useTranslations("identity");
  return (
    <Button variant="outline" onClick={() => signOut({ callbackUrl: "/sign-in" })}>
      {t("signOut")}
    </Button>
  );
}
