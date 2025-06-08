// app/campaigns/[id]/page.tsx
import { PrismaClient, GazaGovernorate } from "@prisma/client";
import { notFound } from "next/navigation";
import React from "react";
import DonationSidebar from "../../../components/DonationSidebar";
import ShareSection from "../../../components/ShareSection";
import {
  FaCheckCircle,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

const prisma = new PrismaClient();

// نضبط نوع الـ props بحيث params يكون Promise<{ id: string }>
// هذا يتوافق مع PageProps التي تتوقع params كـ Promise<any>
type Props = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetail({ params }: Props) {
  // ننتظر الـ params حتى نحصل على الـ id
  const { id } = await params;

  // جلب الحملة مع بيانات صاحبها
  const campaign:
    | (Awaited<ReturnType<typeof prisma.campaign.findUnique>> & {
        owner: {
          name: string | null;
          email: string;
          thumbnailUrl: string | null;
          governorate: GazaGovernorate;
        };
      })
    | null = await prisma.campaign.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
          thumbnailUrl: true,
          governorate: true,
        },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  // استخرج الفيديوهات من campaign.videoLinks.set
  type VideoLink = { type: "youtube" | "direct" | "embed"; value: string };
  const videoLinks: VideoLink[] = Array.isArray(
    (campaign.videoLinks as any)?.set
  )
    ? (campaign.videoLinks as any).set
    : [];

  // بيانات وهمية للمتبرعين
  type FakeDonor = {
    name: string;
    amount: number;
    message?: string;
    date: string;
  };
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
    { name: "خالد حسين", amount: 20, date: "2025-05-15" },
    {
      name: "ليلى محمود",
      amount: 75,
      message: "دعم بسيط مع خالص الحب",
      date: "2025-05-14",
    },
    { name: "محمد أبو ريا", amount: 200, date: "2025-05-12" },
    {
      name: "نور الدين علي",
      amount: 30,
      message: "إلى الأمام دائمًا",
      date: "2025-05-10",
    },
    { name: "هند عبد الرحمن", amount: 60, date: "2025-05-08" },
    {
      name: "سالم الجندي",
      amount: 100,
      message: "خالص الدعاء بالتوفيق",
      date: "2025-05-05",
    },
  ];

  // أعلى ثلاثة متبرعين
  const topDonors = [...fakeDonors]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // ترجمة enum الخاصة بمحافظات غزة إلى نص عربي
  const governorateLabels: Record<GazaGovernorate, string> = {
    GAZA: "محافظة غزة",
    NORTH_GAZA: "محافظة شمال غزة",
    KHAN_YUNIS: "محافظة خان يونس",
    RAFAH: "محافظة رفح",
    DEIR_AL_BALAH: "محافظة دير البلح",
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* ===== اليسار: محتوى الحملة ===== */}
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl font-bold">{campaign.title}</h1>

          <div>
            <img
              src={campaign.imageUrl}
              alt="Cover Image"
              className="w-full max-h-96 object-cover rounded-lg shadow"
            />
          </div>

          <div className="whitespace-pre-line text-lg leading-relaxed mb-6">
            {campaign.description}
          </div>

          {videoLinks.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-2xl font-semibold">فيديوهات الحملة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoLinks.map((vl, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-2 bg-base-50 dark:bg-base-200"
                  >
                    {vl.type === "youtube" && (
                      <div className="aspect-video">
                        <iframe
                          src={vl.value.replace("watch?v=", "embed/")}
                          allowFullScreen
                          className="w-full h-full rounded"
                        />
                      </div>
                    )}
                    {vl.type === "direct" && (
                      <video
                        controls
                        src={vl.value}
                        className="w-full h-auto rounded"
                      />
                    )}
                    {vl.type === "embed" && (
                      <div
                        className="mt-2"
                        dangerouslySetInnerHTML={{ __html: vl.value }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4 bg-base-100 dark:bg-base-200 shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              {campaign.owner.thumbnailUrl && (
                <img
                  src={campaign.owner.thumbnailUrl}
                  alt="Owner Thumbnail"
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-lg font-medium flex items-center gap-2">
                  {campaign.owner.name || campaign.owner.email}{" "}
                  <FaCheckCircle className="text-blue-500" title="تم التحقق" />
                </p>
                <p className="text-gray-500 text-sm">
                  {governorateLabels[campaign.owner.governorate]}
                </p>
                <p className="text-gray-500 text-sm">
                  أنشئت في:{" "}
                  <span className="font-medium">
                    {new Date(campaign.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {campaign.facebookUrl && (
                <a
                  href={campaign.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaFacebook size={24} />
                </a>
              )}
              {campaign.instagramUrl && (
                <a
                  href={campaign.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-pink-500 hover:text-pink-700"
                >
                  <FaInstagram size={24} />
                </a>
              )}
              {campaign.tiktokUrl && (
                <a
                  href={campaign.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-black hover:text-gray-800"
                >
                  <FaTiktok size={24} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              أحدث المتبرعين
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fakeDonors.map((donor, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-2 bg-base-50 dark:bg-base-200 hover:shadow transition-shadow text-sm"
                >
                  <p>
                    <span className="font-medium">{donor.name}</span> –{" "}
                    <span className="font-semibold">{donor.amount} USD</span>
                  </p>
                  {donor.message && (
                    <p className="italic text-xs mt-1">"{donor.message}"</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(donor.date).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <a href="/campaigns" className="btn btn-outline">
              ← العودة إلى قائمة الحملات
            </a>
          </div>
        </div>

        {/* ===== اليمين: Sidebar ثابت ===== */}
        <div className="w-full lg:w-1/3 flex-shrink-0 mt-8 lg:mt-0">
          <div className="sticky top-32 space-y-6">
            <DonationSidebar
              campaignId={campaign.id}
              currentAmount={campaign.currentAmount}
              goalAmount={campaign.goalAmount}
            />

            <ShareSection campaignId={campaign.id} title={campaign.title} />

            <div className="border rounded-lg p-4 bg-base-50 dark:bg-base-200 shadow">
              <h3 className="text-xl font-semibold mb-3 text-center">
                الأعلى تبرعًا
              </h3>
              <ul className="space-y-2">
                {topDonors.map((donor, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{donor.name}</span>
                    <span className="font-semibold">{donor.amount} USD</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
