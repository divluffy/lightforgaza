"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }
    fetch("/api/admin/campaigns")
      .then((res) => {
        if (!res.ok) throw new Error("فشل في جلب البيانات");
        return res.json();
      })
      .then((data) => {
        setCampaigns(data.campaigns || []);
      })
      .catch(() => {
        setError("حدث خطأ أثناء جلب الحملات");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session, status, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الحملة؟")) return;
    const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("تعذّر حذف الحملة. حاول لاحقًا.");
    } else {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
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
                    <Link
                      href={`/admin/campaigns/${camp.id}/edit`}
                      className="btn btn-sm btn-outline"
                    >
                      تعديل
                    </Link>
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
