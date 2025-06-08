// app\auth\login\page.tsx
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

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push(callbackUrl);
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
      adminLogin: "false",
      callbackUrl,
    });

    if (res?.error) {
      setError(t("login.errors.invalidCredentials"));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-md">
        <div className="card-body space-y-6">
          <h2 className="text-3xl font-bold text-center">{t("login.title")}</h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">
                <span className="label-text">{t("login.email")}</span>
              </label>
              <input
                type="email"
                placeholder={t("login.placeholderEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">{t("login.password")}</span>
              </label>
              <input
                type="password"
                placeholder={t("login.placeholderPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${
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
                {t("login.new_register")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
