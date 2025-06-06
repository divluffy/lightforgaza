// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // تأكد أن لديك ملف prisma client
import { hash } from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      nationalId,
      dateOfBirth,
      governorate,
      thumbnailUrl,
    }: {
      name: string;
      email: string;
      password: string;
      phone: string;
      nationalId: string;
      dateOfBirth: string;
      governorate: string;
      thumbnailUrl: string;
    } = body;

    // ١. تحقق بسيط في الـ API (يمكن إضافة المزيد حسب الحاجة)
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !nationalId ||
      !dateOfBirth ||
      !governorate ||
      !thumbnailUrl
    ) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة." },
        { status: 400 }
      );
    }

    // ٢. تأكد أن nationalId و email ليسا مستخدمين مسبقًا
    const existingByNational = await prisma.user.findUnique({
      where: { nationalId },
    });
    if (existingByNational) {
      return NextResponse.json(
        { error: "رقم الهوية هذا مستخدم من قبل. الرجاء استخدام رقم آخر." },
        { status: 400 }
      );
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingByEmail) {
      return NextResponse.json(
        {
          error:
            "البريد الإلكتروني هذا مستخدم من قبل. الرجاء تسجيل الدخول أو استخدام بريد آخر.",
        },
        { status: 400 }
      );
    }

    // ٣. تشفير كلمة المرور
    const hashedPassword = await hash(password, 12);

    // ٤. إنشاء المستخدم في قاعدة البيانات
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        nationalId,
        dateOfBirth: new Date(dateOfBirth),
        governorate: governorate as any, // إذا enum في Prisma
        thumbnailUrl,
        password: hashedPassword,
      },
    });

    // ٥. نُعيد معلومات المستخدم الذي تم إنشاؤه (من الممكن إخفاء الحقول الحساسة إذا أردت)
    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        dateOfBirth: user.dateOfBirth,
        governorate: user.governorate,
        thumbnailUrl: user.thumbnailUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // إذا أخطأنا شيئًا ولم يلتقط في التحقق السابق
    if (error.code === "P2002") {
      // خطأ تكرار مفتاح فريد في Prisma
      // من الممكن أن يكون السبب تكرار nationalId أو email أو غيرهما
      return NextResponse.json(
        {
          error: "هناك قيمة مكررة في أحد الحقول الفريدة (nationalId أو email).",
        },
        { status: 400 }
      );
    }
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "خطأ داخلي في الخادم. حاول لاحقًا." },
      { status: 500 }
    );
  }
}
