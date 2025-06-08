// app/api/admin/campaigns/pending/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const campaigns = await prisma.campaign.findMany({
    where: { approved: false },
    include: { owner: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ campaigns });
}
