// app/campaigns/create/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/app/config/firebaseConfig";
import { Spinner } from "@/app/components/Spinner";

// قائمة أنواع الحملة
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

export default function CreateCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // الحقول الأساسية
  const [title, setTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState<number | "">("");
  const [shortMessage, setShortMessage] = useState(""); // رسالة الشكر القصيرة (<200 حرف)
  const [campaignType, setCampaignType] = useState(campaignTypes[0].value);

  // روابط التواصل (اختيارية)
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // استخدمنا textarea بديلًا عن ReactQuill (Rich Text) مؤقتًا
  const [description, setDescription] = useState("");

  // الفيديو: يمكن للمستخدم إدخال ثلاثة أنواع (youtube, direct, embed)
  const [videoLinks, setVideoLinks] = useState<
    { type: "youtube" | "direct" | "embed"; value: string }[]
  >([{ type: "youtube", value: "" }]);

  // الغلاف (cover)
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // للمعاينة
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(""); // بعد الرفع

  // حالات الخطأ والتحميل
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. التحقق من الجلسة
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/campaigns/create");
    }
  }, [session, status, router]);

  // 2. التعامل مع اختيار صورة الغلاف واستعراض المعاينة
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
    setUploadedImageUrl("");
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

  // دالة التحقق من صحة الحقول قبل الإرسال
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
    if (!file && !uploadedImageUrl) return "غلاف الحملة (صورة) إلزامي";
    // يمكن إضافة تحقق إضافي لروابط التواصل (صيغة URL) إذا رغبت
    return null;
  };

  // 3. عند النقر على "إنشاء الحملة"
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    // رفع الغلاف إن لم يكن مرفوعًا مسبقًا
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
              // يمكن رسم شريط تقدّم هنا لو أردت
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

    // تحضير بيانات الفيديو لتخزينها كـ JSON
    const sanitizedVideoLinks = videoLinks
      .filter((vl) => vl.value.trim())
      .map((vl) => ({
        type: vl.type,
        value: vl.value.trim(),
      }));

    // إرسال الطلب إلى API
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          goalAmount: Number(goalAmount),
          facebookUrl: facebookUrl.trim() || null,
          instagramUrl: instagramUrl.trim() || null,
          tiktokUrl: tiktokUrl.trim() || null,
          otherSocialLinks: null, // أو { ... } إذا أردت إضافة روابط إضافية
          videoLinks: sanitizedVideoLinks,
          thankYouMessage: shortMessage.trim(),
          campaignType,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "خطأ في إنشاء الحملة");
        setIsSubmitting(false);
        return;
      }

      // الانتقال إلى صفحة الحملة الجديدة
      router.push(`/campaigns/${data.campaign.id}`);
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError("حدث خطأ أثناء إنشاء الحملة");
      setIsSubmitting(false);
    }
  };

  // إذا كان التطبيق لا يزال في طور التحقق من الجلسة أو الرفع
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow w-full max-w-3xl mx-auto">
        <div className="card-body space-y-4">
          <h1 className="text-2xl font-bold text-center mb-2">
            إنشاء حملة جديدة
          </h1>

          {/* ملاحظات قبل إنشاء الحملة */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700 mb-1">
              ملاحظة: سيتم اقتطاع نسبة صغيرة جداً من كل حملة لدعم تشغيل المنصة
              وفريق العمل.
            </p>
            <p className="text-yellow-700 mb-1">
              يمكنك طلب سحب الأموال عند اجتياز مبلغ <strong>500$</strong>، سيتم
              التحويل تلقائياً على بيانات التحويل التي أضفتها في صفحة سحب
              الأموال.
            </p>
            <p className="text-yellow-700">
              التبرعات عبر العملات الرقمية ليست ثابتة القيمة وقد تتغير برصيد
              السوق.
            </p>
          </div>

          {error && (
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

            {/* الغلاف (صورة إلزامية) */}
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

            {/* مربّع النص البسيط للوصف */}
            <div>
              <label className="label">
                <span className="label-text">نص وصف الحملة</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full min-h-[150px]"
                placeholder="أدخل وصف الحملة هنا..."
                required
                disabled={isSubmitting || isUploadingImage}
              />
              <p className="text-sm text-gray-500 mt-1">
                يمكنك استخدام نصّ بسيط بدلاً من المحرّر الغني حالياً.
              </p>
            </div>

            {/* زر إنشاء الحملة */}
            <button
              type="submit"
              className={`btn btn-primary w-full flex items-center justify-center ${
                isSubmitting ? "loading" : ""
              }`}
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting ? "" : "إنشاء الحملة"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
