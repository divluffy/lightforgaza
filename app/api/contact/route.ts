import {} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface RequestBody {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();

    const { fullName, email, phone, subject, message } = body;
    if (!fullName || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // حفظ في قاعدة البيانات
    await prisma.contactRequest.create({
      data: { fullName, email, phone, subject, message },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving contact request:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
