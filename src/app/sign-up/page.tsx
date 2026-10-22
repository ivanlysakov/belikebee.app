import Link from "next/link";
import { SignUpForm } from "@/modules/identity";

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <SignUpForm />
      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
