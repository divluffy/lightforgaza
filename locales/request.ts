// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const SUPPORTED_LOCALES = ["en", "ar", "tr"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";

export default getRequestConfig(async () => {
  // 1. حاول قراءة اللغة من الكوكي أولًا
  const cookieStore = await cookies();
  let locale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;

  // 2. إن لم تكن موجودة أو غير مدعومة، استنتج اللغة من الهيدر
  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    const headerList = await headers();
    const acceptLang = headerList.get("accept-language") || "";
    const detectedList = acceptLang
      .split(",")
      .map((lang) => lang.split(";")[0].trim()) as Locale[];
    locale =
      (detectedList.find((lang) =>
        (SUPPORTED_LOCALES as readonly string[]).includes(lang)
      ) as Locale) || DEFAULT_LOCALE;
  }

  // 3. استورد ملف الـJSON المناسب من مجلد /messages
  const messages = (await import(`./${locale}.json`)).default;

  return { locale, messages };
});
