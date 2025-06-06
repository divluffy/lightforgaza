// app/api/user/campaigns/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  // التأكد من أن المستخدم مسجَّل
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.json({ error: "غير مسجَّل" }, { status: 401 });
  }

  // جلب الحملات مع كل الحقول والعلاقات
  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: token.sub! },
    orderBy: { createdAt: "desc" },
    include: {
      owner: true, // يرجع بيانات المستخدم المنشئ بالحملة (User)
      donations: true, // يرجع قائمة التبرعات الخاصة بكل حملة
    },
  });

  return NextResponse.json({ campaigns });
}
