// app/admin/layout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="drawer drawer-mobile h-screen">
      {/* هذا input يتحكّم في فتح/إغلاق الشريط الجانبي على الموبايل */}
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* المحتوى الرئيسي */}
      <div className="drawer-content flex flex-col p-4 overflow-auto">
        {/* زر لفتح الشريط الجانبي عند العرض الصغير */}
        <div className="lg:hidden mb-4">
          <label
            htmlFor="admin-drawer"
            className="btn btn-square btn-ghost"
            aria-label="Open Sidebar"
          >
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

        {/* هنا تُعرض صفحات الـAdmin المختلفة (Dashboard، Campaigns، Donations) */}
        <div className="flex-1">{children}</div>
      </div>

      {/* الشريط الجانبي نفسه */}
      <div className="drawer-side">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-64 bg-base-100 text-base-content space-y-2">
          <li>
            <Link href="/admin" className="rounded-lg">
              <span className="font-semibold">الرئيسية</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/campaigns" className="rounded-lg">
              <span className="font-semibold">إدارة الحملات</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/donations" className="rounded-lg">
              <span className="font-semibold">إدارة التبرعات</span>
            </Link>
          </li>
          <li className="mt-4">
            <Link href="/" className="text-red-600 hover:text-red-800">
              العودة إلى الموقع الرئيسي
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
