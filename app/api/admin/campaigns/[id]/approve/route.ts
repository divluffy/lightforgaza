// app/api/admin/campaigns/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  await prisma.campaign.update({
    where: { id: params.id },
    data: { approved: true },
  });
  return NextResponse.json({ success: true });
}
