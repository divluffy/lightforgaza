import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import Providers from "./providers";
import Navbar from "./components/Navbar";
import "./globals.css";
import Footer from "./components/Footer";
import { Inter, Cairo, Mukta } from "next/font/google";
import Head from "next/head";

// تحميل الخطوط المناسبة:
// - "Cairo" للغة العربية
// - "Inter" للغة الإنجليزية
// - "Mukta" للغة التركية
const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
  weight: ["400", "600", "700"],
});
const mukta = Mukta({
  subsets: ["latin"],
  variable: "--font-mukta",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Light For Gaza",
  description: "Help | Support | Donation",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const allFonts = `${cairo.variable} ${inter.variable} ${mukta.variable}`;

  // إعداد العنوان والوصف متعدد اللغة في الـ<head>
  const titles: Record<string, string> = {
    en: "LightForGaza – Help | Support | Donation",
    ar: "لايت فور غزة – ساعد | دعم | تبرع",
    tr: "LightForGaza – Yardım | Destek | Bağış",
  };
  const descriptions: Record<string, string> = {
    en: "A social platform to support Gaza community through campaigns and donations.",
    ar: "منصة اجتماعية لدعم مجتمع غزة من خلال الحملات والتبرعات.",
    tr: "Gazze topluluğunu kampanyalar ve bağışlarla desteklemek için sosyal platform.",
  };

  return (
    <html lang={locale} dir={dir}>
      <Head>
        <title>{titles[locale]}</title>
        <meta name="description" content={descriptions[locale]} />
        <link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
      </Head>

      <body className={`${allFonts} antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider locale={locale} timeZone={""}>
          <Providers>
            <Navbar
              currentLocale={locale}
              supportedLocales={["en", "ar", "tr"]}
            />

            <main className="flex-1">{children}</main>

            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
