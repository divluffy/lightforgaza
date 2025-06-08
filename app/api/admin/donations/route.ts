// app/api/admin/donations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // تأكّد أنّ المستخدم ADMIN
    const token = await getToken({ req, secret });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // جلب كل التبرعات مع العلاقة إلى المستخدم (user) والعلاقة إلى الحملة (campaign)
    const donations = await prisma.donation.findMany({
      include: {
        user: {
          // في الـ schema المسماة 'user'، لا 'donor'
          select: { name: true, email: true },
        },
        campaign: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ donations });
  } catch (err: any) {
    console.error("❌ [GET /api/admin/donations] error:", err);
    return NextResponse.json({ error: "فشل جلب التبرعات" }, { status: 500 });
  }
}
