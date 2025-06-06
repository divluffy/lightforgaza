// app/campaigns/[id]/page.tsx

import { PrismaClient, Campaign } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";

const prisma = new PrismaClient();

type Props = {
  params: { id: string };
};

type VideoLink = { type: "youtube" | "direct" | "embed"; value: string };

// نعرّف نوع المتبرع الوهمي مؤقتًا
type FakeDonor = {
  name: string;
  amount: number;
  message?: string;
  date: string;
};

export default async function CampaignDetail({ params }: Props) {
  const { id } = params;

  // جلب الحملة مع بيانات المالك
  const campaign:
    | (Campaign & {
        owner: { name: string | null; email: string };
      })
    | null = await prisma.campaign.findUnique({
    where: { id },
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  // إذا كان campaign.videoLinks مخزنًا كـ JSON، نحتاج لتحويله لنوع VideoLink[]
  const videoLinks: VideoLink[] = Array.isArray(campaign.videoLinks)
    ? (campaign.videoLinks as VideoLink[])
    : [];

  // بيانات وهمية للمتبرعين لعرض التصميم حاليًا
  const fakeDonors: FakeDonor[] = [
    {
      name: "أحمد محمد",
      amount: 50,
      message: "وفقكم الله وسدد خطاكم",
      date: "2025-05-20",
    },
    {
      name: "سارة علي",
      amount: 120,
      message: "جزاكم الله خيرًا",
      date: "2025-05-18",
    },
    {
      name: "خالد حسين",
      amount: 20,
      date: "2025-05-15",
    },
    // يُمكن إضافة المزيد حسب الحاجة
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body space-y-6">
          {/* ===== Header: العنوان ومالك الحملة وتاريخ الإنشاء ===== */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{campaign.title}</h1>
              <p className="text-gray-500">
                أنشأها:{" "}
                <span className="font-medium">
                  {campaign.owner.name || campaign.owner.email}
                </span>
              </p>
              <p className="text-gray-500 mt-1">
                تاريخ الإنشاء:{" "}
                <span className="font-medium">
                  {new Date(campaign.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>

            {/* نوع الحملة */}
            <div className="mt-4 md:mt-0">
              <span className="badge badge-primary text-lg">
                {campaign.campaignType}
              </span>
            </div>
          </div>

          {/* ===== صورة الغلاف ===== */}
          <div>
            <img
              src={campaign.imageUrl}
              alt="Cover Image"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>

          {/* ===== الوصف (Rich Text HTML) ===== */}
          <div className="prose prose-arabic">
            {/* نعرض المحتوى كما هو (HTML) */}
            <div
              dangerouslySetInnerHTML={{ __html: campaign.description }}
            ></div>
          </div>

          {/* ===== روابط التواصل الاجتماعي (إذا وُجدت) ===== */}
          {(campaign.facebookUrl ||
            campaign.instagramUrl ||
            campaign.tiktokUrl) && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">روابط التواصل</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {campaign.facebookUrl && (
                  <a
                    href={campaign.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    فيسبوك
                  </a>
                )}
                {campaign.instagramUrl && (
                  <a
                    href={campaign.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    إنستغرام
                  </a>
                )}
                {campaign.tiktokUrl && (
                  <a
                    href={campaign.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    تيك توك
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ===== روابط الفيديو (إن وُجدت) ===== */}
          {videoLinks.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">روابط الفيديو</h2>
              <div className="grid grid-cols-1 gap-4">
                {videoLinks.map((vl, idx) => (
                  <div key={idx} className="border p-4 rounded-lg">
                    {vl.type === "youtube" && (
                      <div>
                        <p className="font-medium">رابط يوتيوب:</p>
                        <a
                          href={vl.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {vl.value}
                        </a>
                      </div>
                    )}
                    {vl.type === "direct" && (
                      <div>
                        <p className="font-medium">رابط فيديو مباشر:</p>
                        <a
                          href={vl.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {vl.value}
                        </a>
                      </div>
                    )}
                    {vl.type === "embed" && (
                      <div>
                        <p className="font-medium">كود مضمّن:</p>
                        <div
                          className="mt-2"
                          dangerouslySetInnerHTML={{ __html: vl.value }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== معلومات الهدف والتبرعات ورسالة الشكر ===== */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">التفاصيل المالية</h2>
            <p className="text-lg">
              المبلغ الراهن:{" "}
              <span className="font-semibold">
                {campaign.currentAmount} USD
              </span>{" "}
              من هدف{" "}
              <span className="font-semibold">{campaign.goalAmount} USD</span>
            </p>
            <progress
              className="progress progress-primary w-full"
              value={campaign.currentAmount}
              max={campaign.goalAmount}
            ></progress>
            <p className="mt-2">
              رسالة الشكر القصيرة:{" "}
              <span className="font-medium">{campaign.thankYouMessage}</span>
            </p>
          </div>

          {/* ===== زر التبرّع (حاليًا يوجه إلى صفحة خارجية أو placeholder) ===== */}
          <div className="card-actions justify-end">
            <Link
              href={`/donations?campaignId=${campaign.id}`}
              className="btn btn-primary btn-lg"
            >
              🌟 تبرّع الآن
            </Link>
          </div>

          {/* ===== قسم المتبرعين (عرض بيانات وهمية حاليًا) ===== */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">أحدث المتبرعين</h2>
            {fakeDonors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fakeDonors.map((donor, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:shadow transition-shadow"
                  >
                    <p>
                      اسم المتبرع:{" "}
                      <span className="font-medium">{donor.name}</span>
                    </p>
                    <p>
                      المبلغ:{" "}
                      <span className="font-semibold">{donor.amount} USD</span>
                    </p>
                    {donor.message && (
                      <p className="italic">رسالة: "{donor.message}"</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      التاريخ:{" "}
                      {new Date(donor.date).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">لا توجد تبرعات حتى الآن.</p>
            )}
          </div>
        </div>
      </div>

      {/* زر رجوع إلى قائمة الحملات */}
      <div className="mt-6">
        <Link href="/campaigns" className="btn btn-outline">
          ← العودة إلى قائمة الحملات
        </Link>
      </div>
    </div>
  );
}
