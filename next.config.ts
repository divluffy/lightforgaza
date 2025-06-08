// next.config.ts (في جذر المشروع)
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

//    هنا نحدد مسار ملف الإعداد i18n/request.ts صراحةً
const withNextIntl = createNextIntlPlugin("./locales/request.ts");

// 2. إعدادات Next.js الاعتيادية (بدون experimental.appDir)
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// 3. صدر التكوين النهائي عبر تمرير nextConfig إلى الدالة الناتجة عن الـplugin
export default withNextIntl(nextConfig);
