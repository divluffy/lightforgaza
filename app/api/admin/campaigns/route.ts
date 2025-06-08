// app/api/admin/campaigns/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // التحقق من صلاحية الأدمن
    const token = await getToken({ req, secret });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // جلب الحملات المعتمدة فقط
    const campaigns = await prisma.campaign.findMany({
      where: { approved: true },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (err: any) {
    console.error("❌ [GET /api/admin/campaigns] error:", err);
    return NextResponse.json(
      { error: "فشل جلب قائمة الحملات" },
      { status: 500 }
    );
  }
}
