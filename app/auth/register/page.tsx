// app/auth/register/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useTranslations } from "next-intl";
import { storage } from "@/app/config/firebaseConfig";
import { Spinner } from "@/app/components/Spinner";

const governorates = [
  { label: "غزة", value: "GAZA" },
  { label: "شمال غزة", value: "NORTH_GAZA" },
  { label: "خان يونس", value: "KHAN_YUNIS" },
  { label: "رفح", value: "RAFAH" },
  { label: "دير البلح", value: "DEIR_AL_BALAH" },
];

export default function RegisterPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();

  // حقول النموذج
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [governorate, setGovernorate] = useState(governorates[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // حالات الخطأ والتحميل
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [acceptPolicies, setAcceptPolicies] = useState(false);

  // إعادة التوجيه في حال وجود جلسة مسجلة
  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push("/");
    }
  }, [session, status, router]);

  // دالة التحقق من صحة الحقول
  const validateFields = (): string | null => {
    if (!name.trim()) return t("register.errors.requiredName");
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return t("register.errors.invalidEmail");
    if (password.length < 6) return t("register.errors.shortPassword");
    if (!phone.match(/^0(59|56)[0-9]{7}$/))
      return t("register.errors.invalidPhone");
    if (!nationalId.match(/^[0-9]{9,10}$/))
      return t("register.errors.invalidNationalId");
    if (!dateOfBirth) return t("register.errors.requiredDob");
    if (new Date(dateOfBirth) >= new Date())
      return t("register.errors.futureDob");
    if (!file) return t("register.errors.requiredImage");
    if (!acceptPolicies) return t("register.errors.acceptPolicies");
    return null;
  };

  // عند اختيار صورة
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

  // إزالة الصورة المحددة
  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl("");
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    // ابدأ رفع الصورة أولاً
    setIsUploadingImage(true);
    try {
      const fileName = `${Date.now()}_${file!.name}`;
      const fileRef = storageRef(storage, `thumbnails/${fileName}`);
      const uploadTask = uploadBytesResumable(fileRef, file!);

      uploadTask.on(
        "state_changed",
        () => {
          // يُمكن هنا إضافة شريط تقدم مخصص
        },
        (uploadErr) => {
          setIsUploadingImage(false);
          setError(t("register.errors.uploadFail"));
        },
        async () => {
          // انتهى رفع الصورة
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setIsUploadingImage(false);

          // ابدأ إنشاء الحساب
          setIsCreatingAccount(true);
          try {
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone,
                nationalId,
                dateOfBirth,
                governorate,
                thumbnailUrl: downloadURL,
              }),
            });
            const data = await res.json();
            if (!res.ok) {
              setError(data.error || t("register.errors.registerFail"));
              setIsCreatingAccount(false);
              return;
            }

            // بعد التسجيل، نسجل الدخول آليًا
            const signInRes = await signIn("credentials", {
              redirect: false,
              email,
              password,
              callbackUrl: "/",
            });
            if (signInRes?.error) {
              setError(t("register.errors.loginFail"));
              setIsCreatingAccount(false);
            } else {
              router.push((signInRes?.url as string) || "/");
            }
          } catch {
            setError(t("register.errors.networkError"));
            setIsCreatingAccount(false);
          }
        }
      );
    } catch {
      setIsUploadingImage(false);
      setError(t("register.errors.networkError"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-8 pt-32">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body space-y-6">
          <h2 className="text-3xl font-bold text-center text-base-content">
            {t("register.title")}
          </h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* الاسم الكامل والبريد الإلكتروني */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    {t("register.fullName")}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={t("register.placeholderName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  disabled={isUploadingImage || isCreatingAccount}
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    {t("register.email")}
                  </span>
                </label>
                <input
                  type="email"
                  placeholder={t("register.placeholderEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  disabled={isUploadingImage || isCreatingAccount}
                  required
                />
              </div>
            </div>

            {/* الهاتف ورقم الهوية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    {t("register.phone")}
                  </span>
                </label>
                <input
                  type="tel"
                  placeholder={t("register.placeholderPhone")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  disabled={isUploadingImage || isCreatingAccount}
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    {t("register.nationalId")}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={t("register.placeholderNationalId")}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  disabled={isUploadingImage || isCreatingAccount}
                  required
                />
              </div>
            </div>

            {/* تاريخ الميلاد والمحافظة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    {t("register.dateOfBirth")}
                  </span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input input-bordered w-full bg-base-200 text-base-content"
                  disabled={isUploadingImage || isCreatingAccount}
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-base-content">
                    {t("register.governorate")}
                  </span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="select select-bordered w-full bg-base-200 text-base-content"
                  disabled={isUploadingImage || isCreatingAccount}
                  required
                >
                  {governorates.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* رفع الصورة الشخصية */}
            <div>
              <label className="label">
                <span className="label-text text-base-content">
                  {t("register.uploadImage")}
                </span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  previewUrl
                    ? "border-primary"
                    : "border-gray-400 dark:border-gray-600"
                }`}
              >
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
                  disabled={isUploadingImage || isCreatingAccount}
                  required={!previewUrl}
                />
                {!previewUrl && !isUploadingImage && (
                  <p className="text-base-content">
                    {t("register.chooseImage")}
                  </p>
                )}
                {previewUrl && !isUploadingImage && (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="thumbnail preview"
                      className="w-24 h-24 object-cover rounded-full mx-auto"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      disabled={isCreatingAccount}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="label">
                <span className="label-text text-base-content">
                  {t("register.password")}
                </span>
              </label>
              <input
                type="password"
                placeholder={t("register.placeholderPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full bg-base-200 text-base-content"
                disabled={isUploadingImage || isCreatingAccount}
                required
                minLength={6}
              />
            </div>

            {/* الموافقة على الشروط وسياسة الخصوصية */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="acceptPolicies"
                checked={acceptPolicies}
                onChange={(e) => setAcceptPolicies(e.target.checked)}
                className="checkbox checkbox-primary mt-1"
                disabled={isUploadingImage || isCreatingAccount}
                required
              />
              <label htmlFor="acceptPolicies" className="text-base-content">
                {t("register.acceptPoliciesPrefix")}&nbsp;
                <Link href="/terms" className="underline text-primary">
                  {t("register.terms")}
                </Link>
                &nbsp;{t("register.and")}&nbsp;
                <Link href="/privacy" className="underline text-primary">
                  {t("register.privacy")}
                </Link>
              </label>
            </div>

            {/* زر التسجيل */}
            <button
              type="submit"
              className={`btn btn-primary w-full flex items-center justify-center ${
                isCreatingAccount ? "btn-disabled" : ""
              }`}
              disabled={isUploadingImage || isCreatingAccount}
            >
              {isCreatingAccount ? <Spinner /> : t("register.createAccount")}
            </button>
          </form>

          <p className="mt-4 text-center text-base-content">
            {t("register.haveAccount")}&nbsp;
            <Link href="/auth/login" className="text-primary hover:underline">
              {t("register.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
