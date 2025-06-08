// app/(admin)/admin/donations/[id]/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type DonationDetail = {
  id: string;
  amount: number;
  createdAt: string;
  donor: { name: string | null; email: string };
  campaign: { title: string };
  donorMessage?: string;
};

export default function AdminDonationDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }
    fetch(`/api/admin/donations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("التبرع غير موجود");
        return res.json();
      })
      .then((data) => {
        setDonation(data.donation);
        setLoading(false);
      })
      .catch(() => {
        setError("التبرع غير موجود");
        setLoading(false);
      });
  }, [session, status, id, router]);

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
  if (!donation) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">تفاصيل التبرع</h1>
      <div className="card bg-white shadow max-w-md">
        <div className="card-body space-y-4">
          <p>
            <span className="font-medium">المانح:</span>{" "}
            {donation.donor.name || donation.donor.email}
          </p>
          <p>
            <span className="font-medium">الحملة:</span>{" "}
            {donation.campaign.title}
          </p>
          <p>
            <span className="font-medium">المبلغ:</span> {donation.amount} USD
          </p>
          {donation.donorMessage && (
            <p>
              <span className="font-medium">رسالة:</span>{" "}
              {donation.donorMessage}
            </p>
          )}
          <p>
            <span className="font-medium">التاريخ:</span>{" "}
            {new Date(donation.createdAt).toLocaleString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="card-actions justify-end">
            <button
              className="btn btn-outline"
              onClick={() => router.push("/admin/donations")}
            >
              رجوع للقائمة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
