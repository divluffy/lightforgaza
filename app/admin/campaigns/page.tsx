// app/admin/campaigns/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  description: string;
  currentAmount: number;
  goalAmount: number;
  owner: { name: string | null; email: string };
};

export default function AdminCampaignsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقّق من الجلسة عند التحميل
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/login?callbackUrl=/admin/campaigns");
    } else {
      // جلب جميع الحملات من الAPI
      fetch("/api/campaigns")
        .then((res) => {
          if (!res.ok) throw new Error("فشل في جلب البيانات");
          return res.json();
        })
        .then((data) => {
          // من المفترض أن data.campaigns موجودة
          setCampaigns(data.campaigns || []);
          setLoading(false);
        })
        .catch(() => {
          setError("حدث خطأ أثناء جلب الحملات");
          setLoading(false);
        });
    }
  }, [session, status, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الحملة؟")) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      // تحديث القائمة بعد الحذف
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("تعذّر حذف الحملة. حاول لاحقًا.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">إدارة الحملات</h1>
      {campaigns.length === 0 ? (
        <p className="text-gray-600">لا توجد حملات حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>المالك</th>
                <th>المبلغ الراهن</th>
                <th>الهدف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id}>
                  <td>
                    <span className="font-medium">{camp.title}</span>
                  </td>
                  <td>{camp.owner.name || camp.owner.email}</td>
                  <td>{camp.currentAmount} USD</td>
                  <td>{camp.goalAmount} USD</td>
                  <td className="space-x-2">
                    <a
                      href={`/admin/campaigns/${camp.id}/edit`}
                      className="btn btn-sm btn-outline"
                    >
                      تعديل
                    </a>
                    <button
                      onClick={() => handleDelete(camp.id)}
                      className="btn btn-sm btn-error"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
