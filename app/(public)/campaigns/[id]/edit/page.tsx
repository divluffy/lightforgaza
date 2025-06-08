// app/campaigns/[id]/edit/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import dynamic from "next/dynamic";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/app/config/firebaseConfig";
import { Spinner } from "@/app/components/Spinner";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type VideoLink = { type: "youtube" | "direct" | "embed"; value: string };

// نفس قائمة أنواع الحملات مثل صفحة الإنشاء
const campaignTypes = [
  { label: "Family", value: "Family" },
  { label: "Community", value: "Community" },
  { label: "Education", value: "Education" },
  { label: "Emergencies", value: "Emergencies" },
  { label: "Events", value: "Events" },
  { label: "Medical", value: "Medical" },
  { label: "Volunteer", value: "Volunteer" },
  { label: "Other", value: "Other" },
];

type CampaignData = {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  videoLinks?: VideoLink[];
  thankYouMessage: string;
  campaignType: string;
  imageUrl: string;
  ownerId: string;
};

export default function EditCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams() as { id: string };

  // بيانات الحملة المحمّلة من السيرفر
  const [campaign, setCampaign] = useState<CampaignData | null>(null);

  // حقول الفورم
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState<number | "">("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [shortMessage, setShortMessage] = useState("");
  const [campaignType, setCampaignType] = useState(campaignTypes[0].value);

  // صورة الغلاف
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // للمعاينة (سواء الأصلية أو الجديدة)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(""); // رابط الصورة المرفوعة (أي بعد الرفع)

  // حالات الخطأ والتحميل
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. التحقق من الجلسة وجلب بيانات الحملة
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push(`/auth/login?callbackUrl=/campaigns/${id}/edit`);
      return;
    }

    // جلب بيانات الحملة
    fetch(`/api/campaigns/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("الحملة غير موجودة");
        return res.json();
      })
      .then((data) => {
        const camp: CampaignData = data.campaign;
        // نتأكد إن صاحب الجلسة هو صاحب الحملة أو ADMIN
        if (
          camp.ownerId !== (session.user as any).id &&
          (session.user as any).role !== "ADMIN"
        ) {
          router.push("/");
          return;
        }
        setCampaign(camp);

        // تعبئة الحقول بالقيم المستلمة
        setTitle(camp.title);
        setDescription(camp.description);
        setGoalAmount(camp.goalAmount);
        setFacebookUrl(camp.facebookUrl || "");
        setInstagramUrl(camp.instagramUrl || "");
        setTiktokUrl(camp.tiktokUrl || "");
        setVideoLinks(camp.videoLinks || []);
        setShortMessage(camp.thankYouMessage);
        setCampaignType(camp.campaignType);
        setPreviewUrl(camp.imageUrl);
        setUploadedImageUrl(camp.imageUrl);

        setFetching(false);
      })
      .catch(() => {
        setError("الحملة غير موجودة أو لا يمكنك تعديلها");
        setFetching(false);
      });
  }, [session, status, router, id]);

  // 2. دالة تغيير الصورة (للمعاينة)
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

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl("");
    setUploadedImageUrl(""); // إذا حُذفت الصورة، نترك هذا الحقل فارغًا
  };

  // إضافة أو إزالة حقل فيديو جديد
  const handleAddVideoLink = () => {
    setVideoLinks([...videoLinks, { type: "youtube", value: "" }]);
  };
  const handleRemoveVideoLink = (index: number) => {
    const updated = [...videoLinks];
    updated.splice(index, 1);
    setVideoLinks(updated);
  };
  const handleVideoLinkChange = (
    index: number,
    field: "type" | "value",
    val: string
  ) => {
    const updated = [...videoLinks];
    updated[index] = { ...updated[index], [field]: val };
    setVideoLinks(updated);
  };

  // 3. التحقق من الحقول قبل الإرسال
  const validateFields = (): string | null => {
    if (!title.trim()) return "العنوان مطلوب";
    if (title.trim().length > 100) return "يجب ألا يتجاوز عنوان الحملة 100 حرف";
    if (!description.trim()) return "الوصف مطلوب";
    if (
      goalAmount === "" ||
      Number(goalAmount) < 1000 ||
      Number(goalAmount) > 100000
    )
      return "هدف المبلغ يجب أن يكون بين 1,000 و 100,000 دولار";
    if (!shortMessage.trim()) return "رسالة الشكر القصيرة مطلوبة";
    if (shortMessage.trim().length > 200)
      return "رسالة الشكر يجب أن لا تتجاوز 200 حرف";
    if (!previewUrl) return "غلاف الحملة (صورة) إلزامي";
    return null;
  };

  // 4. عند النقر على "حفظ التعديلات"
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    // إذا اختار المستخدم صورة جديدة، نرفعها إلى Firebase Storage
    let finalImageUrl = uploadedImageUrl;
    if (file) {
      setIsUploadingImage(true);
      try {
        const fileName = `${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, `campaign-covers/${fileName}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            () => {
              // يمكن رسم شريط تقدّم هنا إذا أردت
            },
            (uploadErr) => {
              setIsUploadingImage(false);
              reject(uploadErr);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              finalImageUrl = downloadURL;
              setUploadedImageUrl(downloadURL);
              setIsUploadingImage(false);
              resolve();
            }
          );
        });
      } catch (err) {
        console.error("Error uploading image:", err);
        setError("فشل رفع صورة الغلاف");
        setIsSubmitting(false);
        return;
      }
    }

    // تجهيز روابط الفيديو المُعقّمة
    const sanitizedVideoLinks = videoLinks
      .filter((vl) => vl.value.trim())
      .map((vl) => ({
        type: vl.type,
        value: vl.value.trim(),
      }));

    // إرسال طلب PUT إلى الـ API
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          goalAmount: Number(goalAmount),
          facebookUrl: facebookUrl.trim() || null,
          instagramUrl: instagramUrl.trim() || null,
          tiktokUrl: tiktokUrl.trim() || null,
          videoLinks: sanitizedVideoLinks,
          thankYouMessage: shortMessage.trim(),
          campaignType,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "خطأ في تحديث الحملة");
        setIsSubmitting(false);
        return;
      }

      // الانتقال إلى صفحة التفاصيل مع التحديث
      router.push(`/campaigns/${id}`);
    } catch (err) {
      console.error("Error updating campaign:", err);
      setError("حدث خطأ أثناء تحديث الحملة");
      setIsSubmitting(false);
    }
  };

  // أثناء التحميل أو الجلب
  if (status === "loading" || fetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="alert alert-error max-w-md w-full">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow w-full max-w-3xl mx-auto">
        <div className="card-body space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">تعديل الحملة</h2>

          {error && campaign && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* عنوان الحملة */}
            <div>
              <label className="label">
                <span className="label-text">عنوان الحملة</span>
              </label>
              <input
                type="text"
                placeholder="مثلاً: حملة دعم مرضى"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                maxLength={100}
                required
                disabled={isSubmitting || isUploadingImage}
              />
              <p className="text-sm text-gray-500 mt-1">{title.length}/100</p>
            </div>

            {/* رسالة الشكر القصيرة */}
            <div>
              <label className="label">
                <span className="label-text">رسالة شكر قصيرة (≤ 200 حرف)</span>
              </label>
              <textarea
                value={shortMessage}
                onChange={(e) => setShortMessage(e.target.value)}
                className="textarea textarea-bordered w-full"
                maxLength={200}
                required
                disabled={isSubmitting || isUploadingImage}
              />
              <p className="text-sm text-gray-500 mt-1">
                {shortMessage.length}/200
              </p>
            </div>

            {/* نوع الحملة */}
            <div>
              <label className="label">
                <span className="label-text">نوع الحملة</span>
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="select select-bordered w-full"
                required
                disabled={isSubmitting || isUploadingImage}
              >
                {campaignTypes.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            {/* روابط التواصل الاجتماعي (اختياري) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">رابط فيسبوك (اختياري)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="input input-bordered w-full"
                  disabled={isSubmitting || isUploadingImage}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">رابط إنستغرام (اختياري)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="input input-bordered w-full"
                  disabled={isSubmitting || isUploadingImage}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">رابط تيك توك (اختياري)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@..."
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="input input-bordered w-full"
                  disabled={isSubmitting || isUploadingImage}
                />
              </div>
            </div>

            {/* الغلاف (صورة) */}
            <div>
              <label className="label">
                <span className="label-text">غلاف الحملة (صورة)</span>
              </label>
              <div className="relative border-2 border-dashed rounded-lg p-4 w-full h-40 flex items-center justify-center">
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg">
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
                      alt="Cover Preview"
                      className="h-36 object-cover rounded-lg"
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
                  <p className="text-gray-500">اضغط لاختيار صورة الغلاف</p>
                )}
              </div>
            </div>

            {/* روابط الفيديو المتعددة */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text">روابط الفيديو (اختياري)</span>
              </label>
              {videoLinks.map((vl, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end"
                >
                  <select
                    value={vl.type}
                    onChange={(e) =>
                      handleVideoLinkChange(
                        idx,
                        "type",
                        e.target.value as "youtube" | "direct" | "embed"
                      )
                    }
                    className="select select-bordered w-full"
                    disabled={isSubmitting || isUploadingImage}
                  >
                    <option value="youtube">رابط يوتيوب</option>
                    <option value="direct">رابط فيديو مباشر</option>
                    <option value="embed">كود مضمن</option>
                  </select>
                  <input
                    type="text"
                    placeholder={
                      vl.type === "embed"
                        ? "<iframe ...></iframe>"
                        : "أدخل الرابط هنا"
                    }
                    value={vl.value}
                    onChange={(e) =>
                      handleVideoLinkChange(idx, "value", e.target.value)
                    }
                    className="input input-bordered w-full"
                    disabled={isSubmitting || isUploadingImage}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVideoLink(idx)}
                    className="btn btn-error btn-sm"
                    disabled={isSubmitting || isUploadingImage}
                  >
                    حذف
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddVideoLink}
                className="btn btn-outline btn-sm mt-2"
                disabled={isSubmitting || isUploadingImage}
              >
                إضافة رابط فيديو آخر
              </button>
            </div>

            {/* هدف المبلغ */}
            <div>
              <label className="label">
                <span className="label-text">هدف المبلغ (USD)</span>
              </label>
              <input
                type="number"
                placeholder="مثلاً: 10000"
                value={goalAmount}
                onChange={(e) =>
                  setGoalAmount(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="input input-bordered w-full"
                min={1000}
                max={100000}
                step={1}
                required
                disabled={isSubmitting || isUploadingImage}
              />
              <p className="text-sm text-gray-500 mt-1">
                يجب أن يكون بين 1,000 و 100,000 دولار
              </p>
            </div>

            {/* محرر النص الغني للوصف */}
            <div>
              <label className="label">
                <span className="label-text">نص وصف الحملة (Rich Text)</span>
              </label>
              <ReactQuill
                value={description}
                onChange={setDescription}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "color",
                  "background",
                  "list",
                  "bullet",
                  "link",
                  "image",
                ]}
                theme="snow"
                className="bg-white"
                readOnly={isSubmitting || isUploadingImage}
              />
              <p className="text-sm text-gray-500 mt-1">
                يُسمح باستخدام الألوان والروابط والصور ضمن الوصف
              </p>
            </div>

            {/* زر حفظ التعديلات */}
            <button
              type="submit"
              className={`btn btn-primary w-full flex items-center justify-center ${
                isSubmitting ? "loading" : ""
              }`}
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting ? "" : "حفظ التعديلات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
