import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SignInForm } from "@/modules/identity";

export default async function SignInPage() {
  const t = await getTranslations("identity.signIn");

  return (
    <>
      <h1 className="type-title">{t("title")}</h1>
      <SignInForm />
      <p className="type-muted">
        {t("noAccount")}{" "}
        <Link href="/sign-up" className="underline">
          {t("signUpLink")}
        </Link>
      </p>
    </>
  );
}
