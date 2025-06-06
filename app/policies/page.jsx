// File: app/policies/page.jsx
"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export default function PoliciesPage() {
  const t = useTranslations();
  const locale = useLocale(); // مثال: "ar" أو "en" أو "tr"
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} className="flex flex-col text-start">
      {/* ========== بانر الصورة أعلى الصفحة ========== */}
      <section className="relative w-full h-[400px]">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2FChatGPT%20Image%20Jun%205%2C%202025%2C%2001_56_10%20PM.png?alt=media&token=0f95dbf7-bcbd-4d14-8e04-92421fa24c06"
          alt="Policies Banner"
          className="w-full h-full object-cover"
        />
        {/* تدرّج داكن فوق الصورة */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/60" />
        {/* عنوان الصفحة في منتصف الصورة */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.h1
            className="text-4xl lg:text-5xl font-bold text-white text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {t("policies.title")}
          </motion.h1>
        </div>
      </section>

      {/* ========== أقسام السياسات ========== */}
      <section className="bg-base-100 dark:bg-base-200">
        <div className="container mx-auto px-6 py-8 space-y-16">
          {/* ------- شروط الاستخدام (Terms of Use) ------- */}
          <motion.div
            className="space-y-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("policies.terms.title")}
            </h2>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("policies.terms.intro")}
            </p>

            {/* أهلية المستخدم */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.terms.eligibility.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.terms.eligibility.desc")}
              </p>
            </div>

            {/* التزامات المتبرعين */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.terms.donors.title")}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.terms.donors.rule1")}</li>
                <li>{t("policies.terms.donors.rule2")}</li>
                <li>{t("policies.terms.donors.rule3")}</li>
                <li>{t("policies.terms.donors.rule4")}</li>
                <li>{t("policies.terms.donors.rule5")}</li>
              </ul>
            </div>

            {/* التزامات أصحاب الحملات */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.terms.owners.title")}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.terms.owners.rule1")}</li>
                <li>{t("policies.terms.owners.rule2")}</li>
                <li>{t("policies.terms.owners.rule3")}</li>
                <li>{t("policies.terms.owners.rule4")}</li>
                <li>{t("policies.terms.owners.rule5")}</li>
              </ul>
            </div>

            {/* طرق التبرع واستلام الأموال */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.terms.donationMethods.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.terms.donationMethods.desc")}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.terms.donationMethods.method1")}</li>
                <li>{t("policies.terms.donationMethods.method2")}</li>
                <li>{t("policies.terms.donationMethods.method3")}</li>
                <li>{t("policies.terms.donationMethods.method4")}</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.terms.donationMethods.receiptInsiders")}
              </p>
            </div>

            {/* الأنشطة المحظورة */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.terms.prohibited.title")}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.terms.prohibited.rule1")}</li>
                <li>{t("policies.terms.prohibited.rule2")}</li>
                <li>{t("policies.terms.prohibited.rule3")}</li>
                <li>{t("policies.terms.prohibited.rule4")}</li>
              </ul>
            </div>

            {/* إنهاء الحساب أو الحظر */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.terms.termination.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.terms.termination.desc")}
              </p>
            </div>
          </motion.div>

          {/* ------- سياسة الخصوصية (Privacy Policy) ------- */}
          <motion.div
            className="space-y-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("policies.privacy.title")}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("policies.privacy.intro")}
            </p>

            {/* جمع المعلومات */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.collection.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.privacy.collection.desc")}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.privacy.collection.item1")}</li>
                <li>{t("policies.privacy.collection.item2")}</li>
                <li>{t("policies.privacy.collection.item3")}</li>
                <li>{t("policies.privacy.collection.item4")}</li>
              </ul>
            </div>

            {/* استخدام المعلومات */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.use.title")}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.privacy.use.item1")}</li>
                <li>{t("policies.privacy.use.item2")}</li>
                <li>{t("policies.privacy.use.item3")}</li>
              </ul>
            </div>

            {/* مشاركة المعلومات */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.sharing.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.privacy.sharing.desc")}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.privacy.sharing.item1")}</li>
                <li>{t("policies.privacy.sharing.item2")}</li>
                <li>{t("policies.privacy.sharing.item3")}</li>
              </ul>
            </div>

            {/* الكوكيز (Cookies) */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.cookies.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.privacy.cookies.desc")}
              </p>
            </div>

            {/* حقوق المستخدم */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.rights.title")}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>{t("policies.privacy.rights.item1")}</li>
                <li>{t("policies.privacy.rights.item2")}</li>
                <li>{t("policies.privacy.rights.item3")}</li>
                <li>{t("policies.privacy.rights.item4")}</li>
              </ul>
            </div>

            {/* أمان البيانات */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.security.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.privacy.security.desc")}
              </p>
            </div>

            {/* خصوصية الأطفال */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.children.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.privacy.children.desc")}
              </p>
            </div>

            {/* تحديثات السياسة */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.changes.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.privacy.changes.desc")}
              </p>
            </div>

            {/* معلومات الاتصال */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("policies.privacy.contact.title")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t("policies.privacy.contact.desc")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
