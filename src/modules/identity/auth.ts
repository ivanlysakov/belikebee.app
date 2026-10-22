import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authorizeCredentials } from "./sign-in";

// Sessions live in a signed JWT cookie, so NextAuth needs no tables of its own.
const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};

// Route handler for /api/auth/[...nextauth].
export const authHandler = NextAuth(authOptions);

// The current session in server components, route handlers and server actions; null when signed out.
export function getSession() {
  return getServerSession(authOptions);
}
