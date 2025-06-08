// app/api/admin/campaigns/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // ننتظر params للحصول على الـ id
  const { id } = await context.params;

  try {
    // مثال على منطق الموافقة: تحديث الحقل approved في جدول campaigns
    const updated = await prisma.campaign.update({
      where: { id },
      data: { approved: true },
    });

    return NextResponse.json(
      { success: true, campaign: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving campaign:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve campaign" },
      { status: 500 }
    );
  }
}
