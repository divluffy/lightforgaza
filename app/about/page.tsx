"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale(); // مثال: "ar" أو "en" أو "tr"
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isRTL = dir === "rtl";
  const sectionRowClass = isRTL ? "lg:flex-row-reverse" : "lg:flex-row";

  return (
    <div dir={dir} className="flex flex-col text-start">
      {/* ========== قسم الـ Hero (عنوان الصفحة مع خلفية ثابتة وعرض كامل) ========== */}
      <section className="relative w-full group">
        {/* الصورة تظهر بارتفاعها الطبيعي وعرض كامل */}
        <img
          src="https://firebasestorage.googleapis.com/v0/b/ultra-gizmo.firebasestorage.app/o/gaza%2Fassets%2F95296a91-f660-4ca5-baed-846ccb4059ab.png?alt=media&token=37eefefa-b169-4b1c-9533-5ac45110c1d5"
          alt="Hero Background"
          className="w-full h-auto object-cover"
          style={{ backgroundAttachment: "fixed" }}
        />

        {/* طبقة تدرّج داكن لتوضيح النص */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 transition-all duration-300 group-hover:from-black/30 group-hover:to-black/30"></div>

        {/* العنوان في وسط الصورة تماماً */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.h1
            className="text-4xl lg:text-5xl font-bold text-white text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {t("about.title")}
          </motion.h1>
        </div>
      </section>

      {/* ========== المحتوى الرئيسي لقسم “من نحن” ========== */}
      <section className="bg-base-100 dark:bg-base-200">
        <div className="container mx-auto px-6 py-16 space-y-12">
          {/* ------- مقدمة وتعريف المنصة والرؤية ------- */}
          <motion.div
            className="space-y-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-gray-100">
              {t("about.heading")}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("about.intro")}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("about.vision")}
            </p>
          </motion.div>

          {/* ------- كيف تعمل المنصة: خطوات بسيطة ------- */}
          <motion.div
            className="space-y-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t("about.how.title")}
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>{t("about.how.step1")}</li>
              <li>{t("about.how.step2")}</li>
              <li>{t("about.how.step3")}</li>
              <li>{t("about.how.step4")}</li>
            </ul>
          </motion.div>

          {/* ------- تعريف الفريق وأدوار الأعضاء ------- */}
          <motion.div
            className="space-y-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t("about.team.title")}
            </h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold">
                  {t("about.team.founder.name")}
                </span>{" "}
                - {t("about.team.founder.role")}
              </p>
              <p>{t("about.team.membersIntro")}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t("about.team.member1")}</li>
                <li>{t("about.team.member2")}</li>
                <li>{t("about.team.member3")}</li>
                <li>{t("about.team.member4")}</li>
              </ul>
            </div>
          </motion.div>

          {/* ------- دعوة للمشاركة (Call to Action) ------- */}
          <motion.div
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("about.cta.title")}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t("about.cta.desc")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="btn btn-primary btn-lg transition-transform duration-300 ease-in-out hover:scale-105"
              >
                {t("about.cta.createCampaign")}
              </Link>
              <Link
                href="/donate"
                className="btn btn-secondary btn-lg transition-transform duration-300 ease-in-out hover:scale-105"
              >
                {t("about.cta.donate")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
