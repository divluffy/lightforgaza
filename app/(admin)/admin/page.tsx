// app/(admin)/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/app/components/Spinner";

type Stats = Record<string, number | null>;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status !== "loading" && (!session || session.user.role !== "ADMIN")) {
      router.push("/admin/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("فشل جلب الإحصائيات");
        return r.json();
      })
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return <Spinner size="lg" />;

  const items: { key: keyof Stats; label: string }[] = [
    ["campaignCount", "الحملات الحالية"],
    ["userCount", "عدد المستخدمين"],
    ["dailyDonations", "التبرعات اليوم"],
    ["totalDonations", "إجمالي التبرعات"],
    ["paidDonations", "التبرعات المدفوعة"],
    ["pendingDonations", "التبرعات المعلقة"],
    ["netRevenue", "الأرباح الصافية"],
    ["platformDonations", "تبرعات المنصة"],
  ] as any;

  return (
    <div data-theme="light" className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
      </header>

      <div className="stats stats-vertical lg:stats-horizontal shadow">
        {items.map(({ key, label }) => (
          <div key={key} className="stat">
            <div className="stat-title">{label}</div>
            <div className="stat-value">
              {stats[key] != null ? (
                stats[key]
              ) : (
                <span className="text-error">–</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
