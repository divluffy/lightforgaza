// app/api/admin/donations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const donation = await prisma.donation.findUnique({
    where: { id: params.id },
    include: {
      donor: { select: { name: true, email: true } },
      campaign: { select: { title: true } },
    },
  });
  if (!donation) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ donation });
}
