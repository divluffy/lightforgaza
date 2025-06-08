// app/campaigns/create/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/app/config/firebaseConfig";
import { Spinner } from "@/app/components/Spinner";

const campaignTypes = [
  { key: "type_family", value: "Family" },
  { key: "type_community", value: "Community" },
  { key: "type_education", value: "Education" },
  { key: "type_emergencies", value: "Emergencies" },
  { key: "type_events", value: "Events" },
  { key: "type_medical", value: "Medical" },
  { key: "type_volunteer", value: "Volunteer" },
  { key: "type_other", value: "Other" },
];

export default function CreateCampaignPage() {
  const t = useTranslations("create_campaign");
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMountedRef = useRef(false);

  // حقول النموذج
  const [title, setTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState<number | "">("");
  const [shortMessage, setShortMessage] = useState("");
  const [campaignType, setCampaignType] = useState(campaignTypes[0].value);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // وصف الحملة (نص عادي)
  const [description, setDescription] = useState("");

  const [videoLinks, setVideoLinks] = useState<
    { type: "youtube" | "direct" | "embed"; value: string }[]
  >([{ type: "youtube", value: "" }]);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تعقب حالة التركيب للتحقق قبل استخدام setState
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // التحقق من الجلسة وإعادة التوجيه إذا لزم الأمر
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/campaigns/create");
    }
  }, [session, status, router]);

  // اختيار صورة الغلاف
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

  // إضافة/حذف حقل فيديو (حد أقصى رابطين)
  const handleAddVideoLink = () => {
    if (videoLinks.length < 2) {
      setVideoLinks([...videoLinks, { type: "youtube", value: "" }]);
    }
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
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setVideoLinks(updated);
  };

  // التحقق من صحة الحقول
  const validateFields = (): string | null => {
    if (!title.trim()) return t("error_title_required");
    if (title.trim().length > 100) return t("error_title_length");

    const trimmedDesc = description.trim();
    if (!trimmedDesc) return t("error_description_required");
    if (trimmedDesc.length > 5000) return t("error_description_length");

    if (
      goalAmount === "" ||
      Number(goalAmount) < 1000 ||
      Number(goalAmount) > 100000
    )
      return t("error_goal");

    if (!shortMessage.trim()) return t("error_thank_required");
    if (shortMessage.trim().length > 200) return t("error_thank_length");

    if (!file && !uploadedImageUrl) return t("error_cover");

    return null;
  };

  // إرسال النموذج
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    // رفع الصورة إن وجدت
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
            () => {},
            (uploadErr) => {
              if (isMountedRef.current) {
                setIsUploadingImage(false);
              }
              reject(uploadErr);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              finalImageUrl = downloadURL;
              if (isMountedRef.current) {
                setUploadedImageUrl(downloadURL);
                setIsUploadingImage(false);
              }
              resolve();
            }
          );
        });
      } catch (err) {
        console.error("Error uploading image:", err);
        if (isMountedRef.current) {
          setError(t("error_cover"));
          setIsSubmitting(false);
        }
        return;
      }
    }

    // إعداد روابط الفيديو
    const sanitizedVideoLinks = videoLinks
      .filter((vl) => vl.value.trim())
      .map((vl) => ({
        type: vl.type,
        value: vl.value.trim(),
      }));

    // إرسال البيانات إلى API
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          goalAmount: Number(goalAmount),
          facebookUrl: facebookUrl.trim() || null,
          instagramUrl: instagramUrl.trim() || null,
          tiktokUrl: tiktokUrl.trim() || null,
          otherSocialLinks: null,
          videoLinks: sanitizedVideoLinks,
          thankYouMessage: shortMessage.trim(),
          campaignType,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (isMountedRef.current) {
          setError(data.error || t("error_cover"));
          setIsSubmitting(false);
        }
        return;
      }

      router.push(`/campaigns/${data.campaign.id}`);
    } catch (err) {
      console.error("Error creating campaign:", err);
      if (isMountedRef.current) {
        setError(t("error_cover"));
        setIsSubmitting(false);
      }
    }
  };

  // حالتان: لم يكتمل التحقق من الجلسة
  if (status === "loading") {
    return null;
  }

  return (
    <div className="pt-32">
      {/* مساحة أعلى الصفحة */}
      <div className="container mx-auto px-4">
        <div className="card bg-base-100 shadow w-full max-w-3xl mx-auto mb-16">
          <div className="card-body space-y-6">
            <h1 className="text-2xl font-bold text-center mt-4">
              {t("page_title")}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* أولاً: الحقول الأساسية */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("title_label")}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={t("title_placeholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered w-full mt-1"
                  maxLength={100}
                  required
                  disabled={isSubmitting || isUploadingImage}
                />
                <p className="text-sm text-gray-500 mt-1">{title.length}/100</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("description_label")}
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered w-full h-56 mt-1 bg-white dark:bg-gray-800 text-black dark:text-white"
                  maxLength={5000}
                  placeholder={t("description_placeholder")}
                  required
                  disabled={isSubmitting || isUploadingImage}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {description.trim().length}/5000
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      {t("goal_label")}
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder={t("goal_placeholder")}
                    value={goalAmount}
                    onChange={(e) =>
                      setGoalAmount(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="input input-bordered w-full mt-1"
                    min={1000}
                    max={100000}
                    step={1}
                    required
                    disabled={isSubmitting || isUploadingImage}
                  />
                  <p className="text-sm text-gray-500 mt-1">{t("goal_hint")}</p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      {t("type_label")}
                    </span>
                  </label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="select select-bordered w-full mt-1"
                    required
                    disabled={isSubmitting || isUploadingImage}
                  >
                    {campaignTypes.map(({ key, value }) => (
                      <option key={value} value={value}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("thank_label")}
                  </span>
                </label>
                <textarea
                  value={shortMessage}
                  onChange={(e) => setShortMessage(e.target.value)}
                  className="textarea textarea-bordered w-full mt-1"
                  maxLength={200}
                  required
                  disabled={isSubmitting || isUploadingImage}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {shortMessage.length}/200
                </p>
              </div>

              {/* ثانياً: روابط التواصل الاجتماعي */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">{t("facebook_label")}</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="input input-bordered w-full mt-1"
                    disabled={isSubmitting || isUploadingImage}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">{t("instagram_label")}</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="input input-bordered w-full mt-1"
                    disabled={isSubmitting || isUploadingImage}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">{t("tiktok_label")}</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@..."
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="input input-bordered w-full mt-1"
                    disabled={isSubmitting || isUploadingImage}
                  />
                </div>
              </div>

              {/* ثالثاً: صورة الغلاف */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("cover_label")}
                  </span>
                </label>
                <div className="relative border-2 border-dashed rounded-lg p-2 w-full h-60 flex items-center justify-center overflow-hidden mt-1">
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
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
                    <div className="relative w-full h-full">
                      <img
                        src={previewUrl}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        disabled={isSubmitting}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      {t("cover_placeholder")}
                    </p>
                  )}
                </div>
              </div>

              {/* رابعاً: روابط الفيديو */}
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("video_label")}
                  </span>
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
                      className="select select-bordered w-full mt-1"
                      disabled={isSubmitting || isUploadingImage}
                    >
                      <option value="youtube">
                        {t("video_option_youtube")}
                      </option>
                      <option value="direct">{t("video_option_direct")}</option>
                      <option value="embed">{t("video_option_embed")}</option>
                    </select>
                    <input
                      type="text"
                      placeholder={
                        vl.type === "embed"
                          ? t("video_embed_placeholder")
                          : t("video_input_placeholder")
                      }
                      value={vl.value}
                      onChange={(e) =>
                        handleVideoLinkChange(idx, "value", e.target.value)
                      }
                      className="input input-bordered w-full mt-1"
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
                  disabled={
                    videoLinks.length >= 2 || isSubmitting || isUploadingImage
                  }
                >
                  {t("add_video_button")}
                </button>
              </div>

              {/* أخيراً: زر الإرسال والملاحظات */}
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                className={`btn btn-primary w-full flex items-center justify-center ${
                  isSubmitting ? "loading" : ""
                }`}
                disabled={isSubmitting || isUploadingImage}
              >
                {t("submit_button")}
              </button>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 space-y-2">
                <p className="text-yellow-700">{t("note_1")}</p>
                <p className="text-yellow-700">{t("note_2")}</p>
                <p className="text-yellow-700">{t("note_3")}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
