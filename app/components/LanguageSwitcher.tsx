// app/components/LanguageSwitcher.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

type LanguageSwitcherProps = {
  currentLocale: string;
  supportedLocales: string[];
};

export default function LanguageSwitcher({
  currentLocale,
  supportedLocales,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const t = useTranslations(); // إذا أردت استخدام الترجمات في العنصر نفسه

  // خريطة للأسماء المحسّنة لكل لغة
  const langNames: Record<string, string> = {
    ar: "العربية",
    en: "English",
    tr: "Türkçe",
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // نحفظ اللغة الجديدة في الكوكيز حتى next-intl يلتقطها عند إعادة التحميل
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // نجري إعادة تحميل خفيفة للصفحة حتى next-intl يعيد جلب الترجمات بناءً على الكوكي الجديد
    router.refresh();
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      className="select select-bordered select-sm w-auto"
      aria-label="تغيير اللغة"
    >
      {supportedLocales.map((loc) => (
        <option key={loc} value={loc}>
          {langNames[loc] || loc}
        </option>
      ))}
    </select>
  );
}
