// app/profile/edit/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/app/config/firebaseConfig";
import { Spinner } from "@/app/components/Spinner";

const governorates = [
  { label: "غزة", value: "GAZA" },
  { label: "شمال غزة", value: "NORTH_GAZA" },
  { label: "خان يونس", value: "KHAN_YUNIS" },
  { label: "رفح", value: "RAFAH" },
  { label: "دير البلح", value: "DEIR_AL_BALAH" },
];

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // حقول المستخدم في الحالة
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [governorate, setGovernorate] = useState(governorates[0].value);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // حالات الخطأ والتحميل
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. التحقق من الجلسة وملء الحقول بالتفاصيل القديمة
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // إذا لم يكن المستخدم مسجلًا، نعيد التوجيه لصفحة تسجيل الدخول
      router.push("/auth/login?callbackUrl=/profile/edit");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "فشل جلب بيانات المستخدم");
        }
        const { user } = (await res.json()) as {
          user: {
            name: string;
            email: string;
            phone: string | null;
            nationalId: string;
            dateOfBirth: string | null;
            governorate: string;
            thumbnailUrl: string | null;
          };
        };

        // نملأ الحقول بالقيم القديمة
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setNationalId(user.nationalId || "");
        if (user.dateOfBirth) {
          // نحول ISO string إلى YYYY-MM-DD لعرضه في حقل التاريخ
          setDateOfBirth(user.dateOfBirth.split("T")[0]);
        }
        setGovernorate(user.governorate || governorates[0].value);
        setThumbnailUrl(user.thumbnailUrl);
        setPreviewUrl(user.thumbnailUrl || "");
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("فشل جلب بيانات المستخدم");
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, router]);

  // 2. التعامل مع اختيار الصورة: عرض المعاينة
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  // 3. إزالة الصورة المختارة والعودة للحالة السابقة
  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl("");
    setThumbnailUrl(null);
  };

  // 4. دالة التحقق من صحة الحقول قبل الإرسال
  const validateFields = (): string | null => {
    if (!name.trim()) return "الاسم مطلوب";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "البريد الإلكتروني غير صالح";
    if (!phone.match(/^0(59|56)[0-9]{7}$/)) return "رقم الهاتف غير صالح";
    if (!nationalId.match(/^[0-9]{9,10}$/)) return "الهوية الوطنية غير صالحة";
    if (!dateOfBirth) return "تاريخ الميلاد مطلوب";
    if (new Date(dateOfBirth) >= new Date())
      return "تاريخ الميلاد لا يمكن أن يكون في المستقبل";
    return null;
  };

  // 5. التعامل مع الإرسال: رفع الصورة (إن وجدت) ثم طلب التحديث إلى API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // التحقق من الحقول
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    let updatedThumbnailUrl = thumbnailUrl;

    // إذا اختار المستخدم صورة جديدة، نرفعها إلى Firebase Storage
    if (file) {
      setIsUploadingImage(true);
      try {
        const fileName = `${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, `thumbnails/${fileName}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            () => {
              // يمكن إضافة شريط تقدم هنا إذا أردنا
            },
            (uploadErr) => {
              setIsUploadingImage(false);
              reject(uploadErr);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              updatedThumbnailUrl = downloadURL;
              setIsUploadingImage(false);
              resolve();
            }
          );
        });
      } catch (err) {
        console.error("Error uploading image:", err);
        setError("فشل رفع الصورة");
        setIsSubmitting(false);
        return;
      }
    }

    // بعد رفع الصورة أو إذا لم يختار المستخدم أي صورة، نرسل الباقي إلى الـ API لتحديث البيانات
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          nationalId: nationalId.trim(),
          dateOfBirth,
          governorate,
          thumbnailUrl: updatedThumbnailUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل تحديث البيانات");
        setIsSubmitting(false);
        return;
      }

      // إذا نجح التحديث نعيد توجيه المستخدم لصفحة البروفايل
      router.push("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("حدث خطأ أثناء التحديث");
      setIsSubmitting(false);
    }
  };

  // 6. عرض Spinner أثناء التحميل
  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 7. واجهة المستخدم (النموذج)
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-8 pt-24">
      <div className="card w-full max-w-2xl bg-base-100 shadow-md rounded-lg">
        <div className="card-body space-y-6">
          <h2 className="text-3xl font-bold text-center text-base-content">
            تعديل معلومات الحساب
          </h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* صورة الحساب */}
            <div className="flex flex-col items-center space-y-2">
              <label className="text-lg font-medium">الصورة الشخصية</label>
              <div className="relative border-2 border-dashed rounded-lg p-4 w-32 h-32 flex items-center justify-center">
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                    <Spinner />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="opacity-0 absolute w-full h-full top-0 left-0 cursor-pointer"
                  disabled={isUploadingImage || isSubmitting}
                />
                {previewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-28 h-28 object-cover rounded-full border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">اختيار صورة</p>
                )}
              </div>
            </div>

            {/* الاسم والبريد الإلكتروني (البريد الثابت غير قابل للتعديل) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    الاسم الكامل
                  </span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    البريد الإلكتروني
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="input input-bordered w-full bg-gray-100 text-base-content cursor-not-allowed"
                />
              </div>
            </div>

            {/* الهاتف والهوية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    رقم الهاتف
                  </span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    الهوية الوطنية
                  </span>
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* تاريخ الميلاد والمحافظة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    تاريخ الميلاد
                  </span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-base-content">المحافظة</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="select select-bordered w-full bg-base-200 text-base-content"
                  required
                  disabled={isSubmitting}
                >
                  {governorates.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* زر الحفظ */}
            <button
              type="submit"
              className={`btn btn-primary w-full flex items-center justify-center ${
                isSubmitting ? "btn-disabled" : ""
              }`}
              disabled={isUploadingImage || isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "حفظ التغييرات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
