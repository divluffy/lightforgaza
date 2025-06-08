// app/api/campaigns/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Campaign } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET!;

type CampaignWithOwner = Campaign & {
  owner: { name: string | null; email: string };
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const sort = searchParams.get("sort") || undefined;

  const whereClause: any = {};
  if (search) whereClause.title = { contains: search, mode: "insensitive" };
  if (type) whereClause.campaignType = type;

  let orderByClause: any = { createdAt: "desc" };
  switch (sort) {
    case "oldest":
      orderByClause = { createdAt: "asc" };
      break;
    case "mostDonations":
      orderByClause = { currentAmount: "desc" };
      break;
    case "leastDonations":
      orderByClause = { currentAmount: "asc" };
      break;
    case "newest":
    default:
      orderByClause = { createdAt: "desc" };
  }

  const campaigns: CampaignWithOwner[] = await prisma.campaign.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  let body: {
    title: string;
    description: string;
    goalAmount: number;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    otherSocialLinks?: any;
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
    otherSocialLinks,
    videoLinks,
    thankYouMessage,
    campaignType,
    imageUrl,
  } = body;

  if (
    !title?.trim() ||
    title.length > 100 ||
    !description?.trim() ||
    !imageUrl?.trim() ||
    !thankYouMessage?.trim() ||
    thankYouMessage.length > 200 ||
    !campaignType
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
    const campaign = await prisma.campaign.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        goalAmount,
        facebookUrl: facebookUrl?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        tiktokUrl: tiktokUrl?.trim() || null,
        otherSocialLinks: otherSocialLinks || null,
        videoLinks: sanitizedVideoLinks ? { set: sanitizedVideoLinks } : null,
        thankYouMessage: thankYouMessage.trim(),
        campaignType: campaignType as any,
        ownerId: token.sub!,
      },
    });

    return NextResponse.json({ campaign });
  } catch (err: any) {
    console.error("Error creating campaign:", err);
    return NextResponse.json(
      { error: "فشل إنشاء الحملة، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
