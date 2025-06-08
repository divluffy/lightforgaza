// app/(public)/layout.tsx
import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getLocale } from "next-intl/server";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  return (
    <>
      <Navbar currentLocale={locale} supportedLocales={["en", "ar", "tr"]} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
