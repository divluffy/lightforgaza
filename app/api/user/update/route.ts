// app/api/user/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";

const secret = process.env.NEXTAUTH_SECRET!;

export async function PUT(req: NextRequest) {
  // نتحقق من أن المستخدم مسجل
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.json({ error: "غير مسجَّل" }, { status: 401 });
  }

  const userId = token.sub!;

  // نجلب البيانات المرسلة من العميل
  let body: {
    name?: string;
    phone?: string;
    nationalId?: string;
    dateOfBirth?: string;
    governorate?: string;
    thumbnailUrl?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  // بنية بسيطة للحقول التي نسمح بتحديثها
  const dataToUpdate: Record<string, any> = {};
  if (typeof body.name === "string") dataToUpdate.name = body.name.trim();
  if (typeof body.phone === "string") dataToUpdate.phone = body.phone.trim();
  if (typeof body.nationalId === "string")
    dataToUpdate.nationalId = body.nationalId.trim();
  if (typeof body.dateOfBirth === "string") {
    // تحويل التاريخ من string إلى Date
    dataToUpdate.dateOfBirth = new Date(body.dateOfBirth);
  }
  if (typeof body.governorate === "string")
    dataToUpdate.governorate = body.governorate;
  // thumbnailUrl قد تكون null أو URL سلسلة نصية
  if (body.thumbnailUrl === null) {
    dataToUpdate.thumbnailUrl = null;
  } else if (typeof body.thumbnailUrl === "string") {
    dataToUpdate.thumbnailUrl = body.thumbnailUrl;
  }

  // نحدِّث سجل المستخدم في قاعدة البيانات
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        nationalId: updatedUser.nationalId,
        dateOfBirth: updatedUser.dateOfBirth?.toISOString() || null,
        governorate: updatedUser.governorate,
        thumbnailUrl: updatedUser.thumbnailUrl,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Error updating user:", err);
    // إذا كان الخطأ متعلقًا بالحقول الفريدة (مثل تكرار nationalId أو غيره)، نعطي رسالة مناسبة
    if (err.code === "P2002" && err.meta?.target) {
      return NextResponse.json(
        {
          error: `القيمة الموجودة في ${err.meta.target.join(
            ", "
          )} مُستخدمة بالفعل`,
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "فشل تحديث المستخدم" }, { status: 500 });
  }
}
