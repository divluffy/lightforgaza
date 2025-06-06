"use client";

import Link from "next/link";
import { PhoneIcon, MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations(); // يمكن استخدام t("footer.<key>") لاحقًا

  return (
    <footer className="bg-base-100 shadow-inner">
      <div className="container mx-auto px-6 py-8 flex flex-wrap justify-center">
        {/* القسم الأيسر: شعار ونبذة */}
        <div className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0 text-center">
          <div className="flex flex-col items-center">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2Flogo_medium.png?alt=media&token=82359115-925c-4364-b00c-835b7b626aa8"
              alt={t("footer.logoAlt")}
              className="w-12 h-12 rounded-full mb-4"
            />
            <span className="text-2xl font-bold text-base-content">
              {t("footer.logoAlt")}
            </span>
          </div>
          <p className="mt-4 text-base-content/70 text-center">
            {t("footer.description")}
          </p>
        </div>

        {/* القسم الأوسط: روابط سريعة */}
        <div className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0 text-center">
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-primary">
                {t("footer.home")}
              </Link>
            </li>
            <li>
              <Link href="/campaigns" className="hover:text-primary">
                {t("footer.campaigns")}
              </Link>
            </li>
            <li>
              <Link href="/policies" className="hover:text-primary">
                {t("footer.policies")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                {t("footer.contact")}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary">
                {t("footer.about")}
              </Link>
            </li>
          </ul>
        </div>

        {/* القسم الأيمن: معلومات التواصل */}
        <div className="w-full lg:w-1/3 px-4 text-center">
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            {t("footer.contactInfo")}
          </h3>
          <ul className="space-y-4 text-base-content">
            <li className="flex items-center justify-center space-x-2">
              <MapPinIcon className="h-6 w-6 text-primary" />
              <span>{t("footer.address")}</span>
            </li>
            <li className="flex items-center justify-center space-x-2">
              <PhoneIcon className="h-6 w-6 text-primary" />
              <a href="tel:+970597529501" className="hover:text-primary">
                {t("footer.phone")}
              </a>
            </li>
            <li className="flex items-center justify-center space-x-2">
              <EnvelopeIcon className="h-6 w-6 text-primary" />
              <a
                href="mailto:contact@lightforgaza.org"
                className="hover:text-primary"
              >
                {t("footer.email")}
              </a>
            </li>
          </ul>

          {/* روابط التواصل الاجتماعي */}
          <div className="mt-6 flex justify-center space-x-4">
            {/* Telegram */}
            <a href="#" aria-label="Telegram" className="hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 240 240"
              >
                <path d="M20.04 117.61C20.04 53.44 78.44 -1.25 142.62 -1.25 206.79 -1.25 265.19 53.44 265.19 117.61 265.19 181.78 206.79 236.47 142.62 236.47 78.44 236.47 20.04 181.78 20.04 117.61ZM103.39 164.66V141.81L161.75 100.46C163.31 99.2 162.74 96.65 160.8 96.35L93.13 85.23C90.24 84.79 88.7 87.75 90.64 89.13L128.14 114.57 101.7 119.5C99.07 120.35 97.72 122.97 98.85 124.99L103.39 164.66Z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a href="#" aria-label="WhatsApp" className="hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 448 512"
              >
                <path d="M380.9 97.1C339.5 55.7 288.1 32 234.6 32 104.8 32 0 136.8 0 266.6c0 49.4 16 97.3 46.3 136L0 480l79.6-46.3c37.8 24.6 80.5 37.6 123.8 37.6 129.9 0 234.7-104.8 234.7-234.6 0-53.5-23.7-104.9-65.1-146.6zm-146.3 283.3c-37.5 0-74.4-10-106.3-28.6l-7.6-4.5-47.2 27.7 10-54.7-5-8.1c-21.4-35.3-32.6-75.8-32.6-117.3 0-106 86.2-192.2 192.2-192.2 51.4 0 99.7 20 136.5 56.8 36.8 36.8 56.8 85.1 56.8 136.5 0 106-86.2 192.2-192.2 192.2zm101-134.6c-5.6-2.8-33-16.2-38.1-18-5.1-1.8-8.8-2.8-12.5 2.8s-14.4 18-17.7 21.8c-3.3 3.7-6.7 4.2-12.3 1.4-33.5-16.8-55.4-30-77.6-68.1-5.8-10.1 5.8-9.4 16.6-31.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.3-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.3-10.6-.3s-9.7 1.4-14.8 6.9c-5.1 5.6-19.5 19.1-19.5 46.5s20 54 22.8 57.8c2.8 3.7 39.5 60.3 95.8 84.6 13.4 5.8 23.8 9.3 31.9 11.9 13.4 4 25.6 3.5 35.2 2.1 10.7-1.5 33-13.5 37.7-26.5 4.7-13 4.7-24.1 3.3-26.5-1.4-2.4-5.1-3.7-10.6-6.5z" />
              </svg>
            </a>

            {/* TikTok */}
            <a href="#" aria-label="TikTok" className="hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 448 512"
              >
                <path d="M448 209.2c-17.5 7.8-36.2 13.1-55.8 15.5V121.9h-84.7v184.1c0 13.1-10.6 23.7-23.7 23.7-13.1 0-23.7-10.6-23.7-23.7V133.1c-19.8-.9-39.5-5.5-57.5-14.2v158c0 31.4 22.5 57.9 52.5 63.5 3.4.5 6.8.7 10.2.7 14.2 0 27.9-4.9 39-13.9 11.1 9 24.8 13.9 39 13.9 30 0 54.4-24.4 54.4-54.4V137.5c17.4-2.2 34.3-7.9 49.4-16.7v87.1z" />
              </svg>
            </a>

            {/* Facebook */}
            <a href="#" aria-label="Facebook" className="hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54v-2.89h2.54V10.41c0-2.507 1.493-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.772-1.63 1.562v1.877h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>

            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm8 3h2a1 1 0 011 1v2h-3V5zm-3 2a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </a>

            {/* Twitter */}
            <a href="#" aria-label="Twitter" className="hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.5 3c-2.48 0-4.5 2.02-4.5 4.5 0 .35.04.7.11 1.03A12.94 12.94 0 013 4.8a4.49 4.49 0 00-.61 2.27c0 1.56.79 2.94 1.99 3.75A4.47 4.47 0 013 10v.05c0 2.19 1.56 4.02 3.63 4.44a4.52 4.52 0 01-2.03.08 4.5 4.5 0 004.2 3.12A9 9 0 012 19.54a12.72 12.72 0 006.88 2.02c8.26 0 12.77-6.84 12.77-12.78 0-.2 0-.39-.01-.58A9.14 9.14 0 0023 3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* حقوق النشر */}
      <div className="border-t border-base-200 mt-8 pt-4">
        <p className="text-center text-base-content/70 text-sm">
          {t("footer.copyRight", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
