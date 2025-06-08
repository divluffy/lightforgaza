// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const stats: Record<string, number | null> = {
    campaignCount: null,
    userCount: null,
    dailyDonations: null,
    totalDonations: null,
    paidDonations: null,
    pendingDonations: null,
    netRevenue: null,
    platformDonations: null,
  };

  try {
    stats.campaignCount = await prisma.campaign.count();
  } catch {}
  try {
    stats.userCount = await prisma.user.count();
  } catch {}
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.dailyDonations = await prisma.donation.count({
      where: { createdAt: { gte: today } },
    });
  } catch {}
  try {
    stats.totalDonations = await prisma.donation.count();
  } catch {}
  try {
    stats.paidDonations = await prisma.donation.count({
      where: { signature: { not: null } },
    });
  } catch {}
  try {
    stats.pendingDonations = await prisma.donation.count({
      where: { signature: null },
    });
  } catch {}
  try {
    const sum = await prisma.donation.aggregate({ _sum: { amount: true } });
    stats.netRevenue = (sum._sum.amount ?? 0) * 0.05;
  } catch {}
  try {
    // no direct model for platform donations: set 0
    stats.platformDonations = 0;
  } catch {}

  return NextResponse.json(stats);
}
