import Link from "next/link";
import { getSession, SignOutButton } from "@/modules/identity";

export default async function HomePage() {
  const session = await getSession();

  return (
    <>
      <h1 className="text-2xl font-semibold">BeLikeBee</h1>
      {session ? (
        <>
          <p>
            Signed in as <strong>{session.user.email}</strong> ({session.user.role})
          </p>
          <SignOutButton />
        </>
      ) : (
        <p>
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/sign-up" className="underline">
            create an account
          </Link>
          .
        </p>
      )}
    </>
  );
}
