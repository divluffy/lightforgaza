// app/api/admin/donations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // استخراج الـ id من params (Promise)
  const { id } = await context.params;

  // التحقق من صلاحية المستخدم كمسؤول
  const token = await getToken({ req, secret });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // جلب بيانات التبرع مع بيانات المستخدم (user) وبيانات الحملة
  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      campaign: { select: { title: true } },
    },
  });

  if (!donation) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ donation });
}
