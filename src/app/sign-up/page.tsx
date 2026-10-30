import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SignUpForm } from "@/modules/identity";

export default async function SignUpPage() {
  const t = await getTranslations("identity.signUp");

  return (
    <>
      <h1 className="type-title">{t("title")}</h1>
      <SignUpForm />
      <p className="type-muted">
        {t("haveAccount")}{" "}
        <Link href="/sign-in" className="underline">
          {t("signInLink")}
        </Link>
      </p>
    </>
  );
}
