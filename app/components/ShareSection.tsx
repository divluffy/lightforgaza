// components/ShareSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaTelegram,
  FaCopy,
  FaQrcode,
  FaTimes,
} from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  campaignId: string;
  title: string;
};

export default function ShareSection({ campaignId, title }: Props) {
  const [campaignUrl, setCampaignUrl] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCampaignUrl(window.location.href);
    }
  }, []);

  const copyLink = () => {
    if (!campaignUrl) return;
    navigator.clipboard
      .writeText(campaignUrl)
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      })
      .catch(() => {});
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      campaignUrl
    )}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      campaignUrl
    )}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      title + " " + campaignUrl
    )}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(
      campaignUrl
    )}&text=${encodeURIComponent(title)}`,
  };

  return (
    <div className="relative">
      <div className="border rounded-lg p-4 bg-base-100 dark:bg-base-200 shadow">
        <h3 className="text-xl font-semibold mb-3 text-center">
          مشاركة الحملة
        </h3>

        <div className="flex justify-around items-center text-sm">
          {/* زر نسخ الرابط (ملون) */}
          <button
            onClick={copyLink}
            className="cursor-pointer flex flex-col items-center justify-center gap-1 text-purple-600 hover:text-purple-800"
          >
            <FaCopy size={20} />
            <span>نسخ</span>
          </button>

          {/* زر QR (ملون) */}
          <button
            onClick={() => setShowQRModal(true)}
            className="cursor-pointer flex flex-col items-center justify-center gap-1 text-green-600 hover:text-green-800"
          >
            <FaQrcode size={20} />
            <span>QR</span>
          </button>

          {/* فيسبوك */}
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <FaFacebook size={20} />
            <span>فيسبوك</span>
          </a>

          {/* تويتر */}
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-blue-400 hover:text-blue-600"
          >
            <FaTwitter size={20} />
            <span>تويتر</span>
          </a>

          {/* واتساب */}
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-green-500 hover:text-green-700"
          >
            <FaWhatsapp size={20} />
            <span>واتساب</span>
          </a>

          {/* تيليجرام */}
          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-blue-500 hover:text-blue-700"
          >
            <FaTelegram size={20} />
            <span>تيليجرام</span>
          </a>
        </div>
      </div>

      {/* toast يظهر بعد النسخ */}
      {showToast && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white px-4 py-1 rounded">
          تم نسخ الرابط!
        </div>
      )}

      {/* نافذة منبثقة لرمز QR باستخدام مكتبة qrcode.react */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-64 relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={18} />
            </button>
            <h4 className="text-lg font-semibold mb-3 text-center">رمز QR</h4>
            <div className="flex justify-center">
              <QRCodeCanvas value={campaignUrl} size={160} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
