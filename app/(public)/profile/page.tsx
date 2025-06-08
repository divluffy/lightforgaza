// app/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  createdAt: string;
  donations: { id: string; amount: number; createdAt: string }[];
};

type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  nationalId: string;
  dateOfBirth: string;
  governorate: string;
  thumbnailUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  campaigns: Campaign[];
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. التأكد من الجلسة
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/profile");
    } else {
      setLoadingSession(false);
    }
  }, [session, status, router]);

  // 2. جلب بيانات المستخدم
  useEffect(() => {
    if (loadingSession) return;

    (async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "فشل في جلب بيانات المستخدم");
        }
        const { user } = (await res.json()) as { user: UserData };
        setUserData(user);
      } catch (err: any) {
        setError(err.message || "حدث خطأ غير متوقع");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [loadingSession]);

  if (status === "loading" || loadingSession || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 pt-16 pb-8">
        <div className="text-red-500 text-center mt-20">{error}</div>
      </main>
    );
  }

  const user = userData!;
  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "غير متوفر";

  // حساب مجموع التبرعات من جميع الحملات
  const totalDonations = user.campaigns.reduce(
    (sum, camp) => sum + camp.donations.reduce((s, d) => s + d.amount, 0),
    0
  );

  return (
    <main className="w-full max-w-4xl mx-auto px-4 pt-32 pb-8 space-y-12">
      {/* SECTION 1: رأس الصفحة */}
      <section className="flex  flex-col md:flex-row items-center md:items-start justify-between">
        <div className="gap-4 flex items-center space-x-4 rtl:space-x-reverse">
          <img
            src={user.thumbnailUrl || "/favicon_lightforgaza.png"}
            alt="User Thumbnail"
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover shadow-lg"
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {user.name || user.email}
            </h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>

        <div className="gap-4 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 rtl:space-x-reverse mt-6 md:mt-0">
          <button
            onClick={() => router.push("/profile/edit")}
            className="btn btn-primary px-6 py-2 text-base"
          >
            تعديل المعلومات الشخصية
          </button>
          <button
            onClick={() => router.push("/campaigns/create")}
            className="btn btn-secondary px-6 py-2 text-base"
          >
            إنشاء حملة
          </button>
        </div>
      </section>

      {/* SECTION 2: الإحصائيات */}
      <section className="card bg-base-100 shadow-lg rounded-lg">
        <div className="card-body">
          <h2 className="text-2xl font-semibold mb-4">الإحصائيات</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="font-medium">مجموع التبرعات:</span>
              <span>{totalDonations.toLocaleString()} </span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">عدد الحملات:</span>
              <span>{user.campaigns.length}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 3: بيانات المستخدم */}
      <section className="card bg-base-100 shadow-lg rounded-lg">
        <div className="card-body">
          <h2 className="text-2xl font-semibold mb-4">معلومات المستخدم</h2>
          <ul className="space-y-3">
            <li className="flex">
              <span className="font-medium w-40">الاسم:</span>
              <span>{user.name || "غير متوفر"}</span>
            </li>
            <li className="flex">
              <span className="font-medium w-40">البريد الإلكتروني:</span>
              <span>{user.email}</span>
            </li>
            <li className="flex">
              <span className="font-medium w-40">الهاتف:</span>
              <span>{user.phone || "غير متوفر"}</span>
            </li>
            <li className="flex">
              <span className="font-medium w-40">رقم الهوية:</span>
              <span>{user.nationalId}</span>
            </li>
            <li className="flex">
              <span className="font-medium w-40">تاريخ الميلاد:</span>
              <span>{formatDate(user.dateOfBirth)}</span>
            </li>
            <li className="flex">
              <span className="font-medium w-40">المحافظة:</span>
              <span>{user.governorate}</span>
            </li>
            <li className="flex">
              <span className="font-medium w-40">تاريخ الانضمام:</span>
              <span>{formatDate(user.createdAt)}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 4: حملاتي */}
      <section className="card bg-base-100 shadow-lg rounded-lg">
        <div className="card-body">
          <h2 className="text-2xl font-semibold mb-4">حملاتي</h2>
          {user.campaigns.length > 0 ? (
            <ul className="space-y-2">
              {user.campaigns.map((camp) => (
                <li key={camp.id} className="flex justify-between">
                  <span>{camp.title}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(camp.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">لم تنشئ أي حملة بعد.</p>
          )}
        </div>
      </section>
    </main>
  );
}
