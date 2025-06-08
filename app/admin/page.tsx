// app\admin\page.tsx

"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "ADMIN") {
      router.push("/admin/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">لوحة تحكم المسؤول</h1>
      <p className="mb-6">من هنا يمكنك إدارة الحملات والتبرعات.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">الحملات</h2>
            <div className="card-actions justify-end">
              <Link href="/admin/campaigns" className="btn btn-primary btn-sm">
                اذهب
              </Link>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">التبرعات</h2>
            <div className="card-actions justify-end">
              <Link href="/admin/donations" className="btn btn-primary btn-sm">
                اذهب
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
