import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSession, SignOutButton } from "@/modules/identity";

export default async function HomePage() {
  const session = await getSession();
  const t = await getTranslations();

  return (
    <>
      <h1 className="text-2xl font-semibold">BeLikeBee</h1>
      {session ? (
        <>
          <p>
            {t.rich("app.home.signedInAs", {
              email: session.user.email ?? "",
              role: t(`identity.roles.${session.user.role}`),
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
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
    </>
  );
}
