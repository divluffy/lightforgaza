// app/api/user/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.json({ error: "غير مسجَّل" }, { status: 401 });
  }

  // نجلب المستخدم كاملاً مع الحقول والعلاقات
  const user = await prisma.user.findUnique({
    where: { id: token.sub! },
    include: {
      campaigns: {
        orderBy: { createdAt: "desc" },
        include: { donations: true },
      },
      donations: true,
      // نضمن أن الحقول التالية موجودة بالفعل في نموذج User: phone, nationalId, dateOfBirth, governorate, createdAt, updatedAt
    },
  });

  if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ user });
}
