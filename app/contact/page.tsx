"use client";

import React, { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");

  // حالات الحالة: "idle" | "submitting" | "success" | "error"
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setStatus("success");

      // **ضمان أن العنصر موجود قبل استدعاء reset()**
      if (formElement) {
        formElement.reset();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || t("errorMessage"));
      setStatus("error");
    }
  }

  return (
    <div className="pt-32 container mx-auto px-4 md:px-8 pb-8">
      <div className="max-w-2xl mx-auto bg-base-100 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-400">{t("description")}</p>

          {status === "success" && (
            <div className="bg-green-100 text-green-800 border border-green-200 p-4 rounded">
              {t("successMessage")}
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-100 text-red-800 border border-red-200 p-4 rounded">
              {errorMessage || t("errorMessage")}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الحقل: الاسم الكامل */}
            <div>
              <label htmlFor="fullName" className="label">
                <span className="label-text">{t("fullNameLabel")}</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder={t("fullNamePlaceholder")}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* الحقل: البريد الإلكتروني */}
            <div>
              <label htmlFor="email" className="label">
                <span className="label-text">{t("emailLabel")}</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* الحقل: رقم الهاتف */}
            <div>
              <label htmlFor="phone" className="label">
                <span className="label-text">{t("phoneLabel")}</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t("phonePlaceholder")}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* الحقل: الموضوع */}
            <div>
              <label htmlFor="subject" className="label">
                <span className="label-text">{t("subjectLabel")}</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder={t("subjectPlaceholder")}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* الحقل: الرسالة */}
            <div>
              <label htmlFor="message" className="label">
                <span className="label-text">{t("messageLabel")}</span>
              </label>
              <textarea
                id="message"
                name="message"
                placeholder={t("messagePlaceholder")}
                className="textarea textarea-bordered w-full"
                rows={6}
                required
              ></textarea>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              className={`btn btn-primary w-full ${
                status === "submitting" ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "..." : t("submitButton")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
