// app/(admin)/admin/donations/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Donation = {
  id: string;
  amount: number;
  createdAt: string;
  donor: { name: string | null; email: string };
  campaign: { title: string };
  donorName?: string | null; // للضيوف
};

export default function AdminDonationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/admin/login");
    } else {
      fetch("/api/admin/donations")
        .then((res) => {
          if (!res.ok) throw new Error("فشل في جلب البيانات");
          return res.json();
        })
        .then((data) => {
          setDonations(data.donations || []);
          setLoading(false);
        })
        .catch(() => {
          setError("حدث خطأ أثناء جلب التبرعات");
          setLoading(false);
        });
    }
  }, [session, status, router]);

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
      <h1 className="text-2xl font-bold mb-4">إدارة التبرعات</h1>
      {donations.length === 0 ? (
        <p className="text-gray-600">لا توجد تبرعات حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>المانح</th>
                <th>المبلغ</th>
                <th>الحملة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((don) => (
                <tr key={don.id}>
                  <td>{don.donor.name || don.donor.email || "ضيف"}</td>
                  <td>{don.amount} USD</td>
                  <td>{don.campaign.title}</td>
                  <td>
                    {new Date(don.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <Link
                      href={`/admin/donations/${don.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      تفاصيل
                    </Link>
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
