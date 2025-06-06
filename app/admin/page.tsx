// app/admin/page.tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // التحقّق إن لم يكن Admin مسجلًا → إعادة توجيه
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/login?callbackUrl=/admin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">مرحبًا في لوحة تحكم المسؤول</h1>
      <p className="text-gray-600 mb-6">
        من هنا يمكنك إدارة جميع الحملات والتبرعات على المنصة.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">إدارة الحملات</h2>
            <p>عرض جميع الحملات، تعديلها أو حذفها.</p>
            <div className="card-actions justify-end">
              <a href="/admin/campaigns" className="btn btn-primary btn-sm">
                اذهب إلى الحملات
              </a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">إدارة التبرعات</h2>
            <p>عرض جميع التبرعات وتفاصيلها.</p>
            <div className="card-actions justify-end">
              <a href="/admin/donations" className="btn btn-primary btn-sm">
                اذهب إلى التبرعات
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
