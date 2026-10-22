import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = { title: "BeLikeBee" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="mx-auto grid max-w-sm gap-6 px-6 py-16">{children}</main>
      </body>
    </html>
  );
}
