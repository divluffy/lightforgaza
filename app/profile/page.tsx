// app/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  createdAt: string;
  // يمكنك إضافة حقول أخرى حسب نموذجك
  donations: { id: string; amount: number; createdAt: string }[];
};

type Donation = {
  id: string;
  amount: number;
  createdAt: string;
  // إذا كان لديك حقول أخرى في التبرع، أضفها هنا
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
  donations: Donation[];
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. نتأكد من الجلسة: إذا لم يكن هناك session، نُعيد التوجيه لصفحة الدخول
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/profile");
    } else {
      setLoadingSession(false);
    }
  }, [session, status, router]);

  // 2. بعد التأكد من وجود session، نطلب البيانات من /api/user/me
  useEffect(() => {
    if (loadingSession) return;

    const fetchUserData = async () => {
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
    };

    fetchUserData();
  }, [loadingSession]);

  // 3. عرض Spinner أثناء أي من مرحلتي التحميل
  if (status === "loading" || loadingSession || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 4. إذا حدث خطأ أثناء جلب البيانات، نظهر رسالة خطأ
  if (error) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 pt-16 pb-8">
        <div className="text-red-500 text-center mt-20">{error}</div>
      </main>
    );
  }

  // 5. إذا البيانات جاهزة
  const user = userData!;

  // دالة لتنسيق التواريخ بصيغة عربية
  const formatDate = (isoDateString?: string) => {
    if (!isoDateString) return "غير متوفر";
    try {
      const date = new Date(isoDateString);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "غير متوفر";
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 pt-16 pb-8">
      {/* رأس الصفحة: صورة المستخدم، اسمه، وزرين (تعديل المعلومات وإنشاء حملة) */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12 pt-32">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
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

        {/* أزرار التعديل وإنشاء الحملة */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 rtl:space-x-reverse mt-6 md:mt-0">
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
      </div>

      {/* تفاصيل الملف الشخصي والبيانات الشخصية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* بيانات الحساب */}
        <div className="card bg-base-100 shadow-lg rounded-lg">
          <div className="card-body">
            <h2 className="text-2xl font-semibold mb-4">بيانات الحساب</h2>
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
                <span className="font-medium w-40">الدور:</span>
                <span>{user.role}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40">تاريخ الإنشاء:</span>
                <span>{formatDate(user.createdAt)}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40">آخر تحديث:</span>
                <span>{formatDate(user.updatedAt)}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* قسم الحملات والتبرعات */}
        <div className="space-y-10">
          <div className="card bg-base-100 shadow-lg rounded-lg">
            <div className="card-body">
              <h2 className="text-2xl font-semibold mb-4">حملاتي</h2>
              {user.campaigns && user.campaigns.length > 0 ? (
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
          </div>

          <div className="card bg-base-100 shadow-lg rounded-lg">
            <div className="card-body">
              <h2 className="text-2xl font-semibold mb-4">تبرعاتي</h2>
              {user.donations && user.donations.length > 0 ? (
                <ul className="space-y-2">
                  {user.donations.map((don) => (
                    <li key={don.id} className="flex justify-between">
                      <span>تبرّع بمبلغ {don.amount} ₪</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(don.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">لم تقدّم أي تبرع بعد.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
