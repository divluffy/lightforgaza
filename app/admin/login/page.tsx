// app/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Spinner } from "@/app/components/Spinner";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // لو المسؤول مُسجّل أصلاً نعيده للوحة /admin
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      adminLogin: "true",
      callbackUrl: "/admin",
    });

    if (res?.error) {
      setError(t("login_admin.errors.invalidCredentials"));
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full items-center justify-center bg-base-300 px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-lg">
        <div className="card-body space-y-6">
          <h2 className="text-3xl font-bold text-center">
            {t("login_admin.adminTitle")}
          </h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">
                <span className="label-text">{t("login_admin.email")}</span>
              </label>
              <input
                type="email"
                placeholder={t("login_admin.placeholderEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">{t("login_admin.password")}</span>
              </label>
              <input
                type="password"
                placeholder={t("login_admin.placeholderPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-accent w-full ${
                loading ? "btn-disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? <Spinner /> : t("login_admin.submit")}
            </button>
          </form>

          <p className="mt-4 text-center">
            <Link href="/auth/login" className="text-secondary hover:underline">
              {t("login_admin.backToUser")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
