// app/components/ShareButtons.tsx
"use client";

import React from "react";

type ShareButtonsProps = {
  campaignUrl: string;
  campaignTitle: string;
};

export function ShareButtons({
  campaignUrl,
  campaignTitle,
}: ShareButtonsProps) {
  const copyLink = () => {
    navigator.clipboard.writeText(campaignUrl).then(() => {
      alert("تم نسخ رابط الحملة");
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
      <button onClick={copyLink} className="btn btn-outline btn-sm flex-1">
        📋 نسخ الرابط
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          campaignUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm flex-1"
      >
        🗣 فيسبوك
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          campaignUrl
        )}&text=${encodeURIComponent(campaignTitle)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm flex-1"
      >
        🐦 تويتر
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
          campaignTitle + " " + campaignUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm flex-1"
      >
        📱 واتساب
      </a>
    </div>
  );
}
