import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSession, SignOutButton } from "@/modules/identity";
import { Button } from "@/shared/ui/button";

export default async function HomePage() {
  const session = await getSession();
  const t = await getTranslations();

  return (
    <div className="theme-apiary grid gap-8 text-foreground">
      <div aria-hidden className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-comb-cell wax-foundation" />
      </div>

      <section className="grid gap-4">
        <div className="grid gap-2">
          <p className="type-muted">BeLikeBee</p>
          <h1 className="type-title text-balance">{t("app.home.title")}</h1>
        </div>
        <p>{t("app.home.lead")}</p>
        <div className="grid justify-items-start gap-2">
          <Button asChild size="lg">
            <Link href="/hives">{t("apiary.nav.browseHives")}</Link>
          </Button>
          <p className="type-muted">{t("app.home.rentalNote")}</p>
        </div>
      </section>

      <section className="grid gap-6">
        <hr className="w-12 border-hive-frame" />
        {session ? (
          <>
            <p>
              {t.rich("app.home.signedInAs", {
                email: session.user.email ?? "",
                role: t(`identity.roles.${session.user.role}`),
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            {session.user.role === "BEEKEEPER" && (
              <Link href="/apiaries" className="underline">
                {t("apiary.nav.myApiaries")}
              </Link>
            )}
            {session.user.role === "ADMIN" && (
              <Link href="/admin/beekeepers" className="underline">
                {t("identity.admin.link")}
              </Link>
            )}
            <SignOutButton />
          </>
        ) : (
          <p>
            {t.rich("app.home.signedOut", {
              signIn: (chunks) => (
                <Link href="/sign-in" className="underline">
                  {chunks}
                </Link>
              ),
              signUp: (chunks) => (
                <Link href="/sign-up" className="underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        )}
      </section>
    </div>
  );
}
