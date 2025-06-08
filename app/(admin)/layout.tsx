// app/(admin)/layout.tsx
"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";

type Props = { children: ReactNode };

export default function AdminLayout({ children }: Props) {
  const { status } = useSession();

  return (
    <div
      className="drawer drawer-mobile lg:drawer-open h-screen"
      data-theme="light"
    >
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* القائمة الجانبية */}
      <div className="drawer-side">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <aside className="w-64 bg-base-100 border-r flex flex-col">
          <div className="px-4 py-6 border-b">
            <h1 className="text-xl font-bold">لوحة الإدارة</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-auto">
            <Link
              href="/admin"
              className="block px-3 py-2 rounded hover:bg-base-200"
            >
              الرئيسية
            </Link>
            <Link
              href="/admin/users"
              className="block px-3 py-2 rounded hover:bg-base-200"
            >
              المستخدمون
            </Link>
            <Link
              href="/admin/campaigns"
              className="block px-3 py-2 rounded hover:bg-base-200"
            >
              الحملات
            </Link>
            <Link
              href="/admin/campaigns/pending"
              className="block px-3 py-2 rounded hover:bg-base-200"
            >
              انتظار الموافقة
            </Link>
            <Link
              href="/admin/donations"
              className="block px-3 py-2 rounded hover:bg-base-200"
            >
              التبرعات
            </Link>
          </nav>
          <div className="px-4 py-4 border-t space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded hover:bg-base-200 text-red-600"
            >
              الموقع الرئيسي
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full text-left px-3 py-2 rounded hover:bg-base-200 text-red-600"
              disabled={status === "loading"}
            >
              تسجيل الخروج
            </button>
          </div>
        </aside>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="drawer-content flex flex-col overflow-auto p-4">
        {/* زر الهمبرغر على الجوال */}
        <div className="lg:hidden mb-4">
          <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
        </div>

        {children}
      </div>
    </div>
  );
}
