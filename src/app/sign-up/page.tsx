import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SignUpForm } from "@/modules/identity";

export default async function SignUpPage() {
  const t = await getTranslations("identity.signUp");

  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <SignUpForm />
      <p className="text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/sign-in" className="underline">
          {t("signInLink")}
        </Link>
      </p>
    </>
  );
}
