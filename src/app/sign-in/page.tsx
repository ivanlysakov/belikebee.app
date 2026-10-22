import Link from "next/link";
import { SignInForm } from "@/modules/identity";

export default function SignInPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <SignInForm />
      <p className="text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/sign-up" className="underline">
          Create one
        </Link>
      </p>
    </>
  );
}
