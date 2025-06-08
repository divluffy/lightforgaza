// app/auth/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // إذا كان قد تم تسجيل الجلسة بالفعل، نوجّه المستخدم إلى المكان المناسب
  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      // إذا كان الدور admin، نذهب إلى /admin
      if ((session.user as any)?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push(callbackUrl);
      }
    }
  }, [session, status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError(t("login.errors.invalidCredentials"));
      setLoading(false);
    } else {
      // هنا لا نعتمد على res.url مباشرة لأننا نتحقق من الدور في effect
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-md">
        <div className="card-body space-y-6">
          <h2 className="text-3xl font-bold text-center text-base-content">
            {t("login.title")}
          </h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* البريد الإلكتروني */}
            <div>
              <label className="label">
                <span className="label-text text-base-content">
                  {t("login.email")}
                </span>
              </label>
              <input
                type="email"
                placeholder={t("login.placeholderEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full bg-base-200 text-base-content"
                disabled={loading}
                required
              />
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="label">
                <span className="label-text text-base-content">
                  {t("login.password")}
                </span>
              </label>
              <input
                type="password"
                placeholder={t("login.placeholderPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full bg-base-200 text-base-content"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full flex items-center justify-center ${
                loading ? "btn-disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? <Spinner /> : t("login.submit")}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <p>
              {t("login.noAccount")}&nbsp;
              <Link
                href="/auth/register"
                className="text-primary hover:underline"
              >
                {t("login.register")}
              </Link>
            </p>
            {/* لقد أزلنا هنا رابط /admin/login */}
          </div>
        </div>
      </div>
    </div>
  );
}
