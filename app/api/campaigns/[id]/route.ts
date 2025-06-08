// app/api/campaigns/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET!;

// ———————————————— GET ————————————————
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← params is a Promise now
) {
  const { id } = await params; // ← await it
  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });
  if (!campaign) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}

// ———————————————— PUT ————————————————
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← same change
) {
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params; // ← await params
  const existing = await prisma.campaign.findUnique({
    where: { id },
  });
  if (!existing) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }
  if (existing.ownerId !== token.sub! && (token as any).role !== "ADMIN") {
    return NextResponse.json(
      { error: "لا تمتلك صلاحيات التعديل" },
      { status: 403 }
    );
  }

  let body: {
    title: string;
    description: string;
    goalAmount: number;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    tiktokUrl?: string | null;
    videoLinks?: { type: string; value: string }[];
    thankYouMessage: string;
    campaignType: string;
    imageUrl: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const {
    title,
    description,
    goalAmount,
    facebookUrl,
    instagramUrl,
    tiktokUrl,
    videoLinks,
    thankYouMessage,
    campaignType,
    imageUrl,
  } = body;

  if (
    !title?.trim() ||
    title.length > 100 ||
    !description?.trim() ||
    !thankYouMessage?.trim() ||
    thankYouMessage.length > 200 ||
    !campaignType ||
    !imageUrl?.trim()
  ) {
    return NextResponse.json(
      { error: "الرجاء ملء جميع الحقول الإلزامية بشكل صحيح" },
      { status: 400 }
    );
  }

  if (goalAmount < 1000 || goalAmount > 100000) {
    return NextResponse.json(
      { error: "هدف المبلغ يجب أن يكون بين 1,000 و 100,000 دولار" },
      { status: 400 }
    );
  }

  const validTypes = [
    "Family",
    "Community",
    "Education",
    "Emergencies",
    "Events",
    "Medical",
    "Volunteer",
    "Other",
  ];
  if (!validTypes.includes(campaignType)) {
    return NextResponse.json({ error: "نوع الحملة غير صالح" }, { status: 400 });
  }

  const sanitizedVideoLinks =
    Array.isArray(videoLinks) && videoLinks.length > 0
      ? videoLinks.filter(
          (vl) =>
            ["youtube", "direct", "embed"].includes(vl.type) && vl.value?.trim()
        )
      : undefined;

  try {
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        goalAmount,
        facebookUrl: facebookUrl?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        tiktokUrl: tiktokUrl?.trim() || null,
        videoLinks: sanitizedVideoLinks
          ? { set: sanitizedVideoLinks }
          : { set: [] },
        thankYouMessage: thankYouMessage.trim(),
        campaignType,
        imageUrl: imageUrl.trim(),
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (err: any) {
    console.error("Error updating campaign:", err);
    return NextResponse.json(
      { error: "فشل تحديث الحملة، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}

// ———————————————— DELETE ————————————————
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← same here
) {
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params; // ← await it
  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });
  if (!campaign) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }
  if (campaign.ownerId !== token.sub! && (token as any).role !== "ADMIN") {
    return NextResponse.json(
      { error: "لا تمتلك صلاحيات الحذف" },
      { status: 403 }
    );
  }

  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ message: "تم حذف الحملة بنجاح" });
}
