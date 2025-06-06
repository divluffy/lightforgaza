// app/admin/campaigns/[id]/edit/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type CampaignData = {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  ownerId: string;
};

export default function AdminEditCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات الحملة أولًا
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/login?callbackUrl=/admin/campaigns");
      return;
    }
    fetch(`/api/campaigns/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("الحملة غير موجودة");
        return res.json();
      })
      .then((data) => {
        const camp = data.campaign as CampaignData;
        setCampaign(camp);
        setTitle(camp.title);
        setDescription(camp.description);
        setGoalAmount(camp.goalAmount);
        setFetching(false);
      })
      .catch(() => {
        setError("الحملة غير موجودة");
        setFetching(false);
      });
  }, [session, status, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !title.trim() ||
      !description.trim() ||
      !goalAmount ||
      goalAmount <= 0
    ) {
      setError("الرجاء ملء جميع الحقول بشكل صحيح");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/campaigns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        goalAmount: Number(goalAmount),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "خطأ في تحديث الحملة");
      setLoading(false);
      return;
    }
    router.push("/admin/campaigns");
  };

  if (status === "loading" || fetching) {
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
      <h1 className="text-2xl font-bold mb-4">تعديل حملة</h1>
      <div className="card bg-base-100 shadow w-full max-w-lg">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">عنوان الحملة</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">وصف الحملة</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">هدف المبلغ (USD)</span>
              </label>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) =>
                  setGoalAmount(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="input input-bordered w-full"
                min={1}
                step={0.01}
                required
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="card-actions justify-end">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "" : "حفظ التعديلات"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/campaigns")}
                className="btn btn-outline"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
