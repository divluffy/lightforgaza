// app/(admin)/admin/campaigns/pending/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Campaign = { id: string; title: string; owner: { email: string } };

export default function PendingCampaignsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [list, setList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }
    fetch("/api/admin/campaigns/pending")
      .then((r) => r.json())
      .then((data) => setList(data.campaigns))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const approve = async (id: string) => {
    await fetch(`/api/admin/campaigns/${id}/approve`, { method: "POST" });
    setList((l) => l.filter((c) => c.id !== id));
  };

  if (loading) return <span className="loading loading-spinner"></span>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">الموافقة على الحملات</h1>
      {list.length === 0 && <p>لا توجد حملات بانتظار الموافقة.</p>}
      <ul className="space-y-2">
        {list.map((c) => (
          <li
            key={c.id}
            className="flex justify-between p-4 bg-white shadow rounded"
          >
            <div>
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-gray-500">{c.owner.email}</p>
            </div>
            <button
              onClick={() => approve(c.id)}
              className="btn btn-sm btn-primary"
            >
              اعتمد
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
