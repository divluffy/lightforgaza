// app\admin\layout.tsx

"use client";
import Link from "next/link";
import { ReactNode } from "react";

type Props = { children: ReactNode };
export default function AdminLayout({ children }: Props) {
  return (
    <div className="drawer drawer-mobile h-screen">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col p-4 overflow-auto">
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
        <div className="flex-1">{children}</div>
      </div>
      <div className="drawer-side">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-64 bg-base-100 text-base-content space-y-2">
          <li>
            <Link href="/admin">
              <span className="font-semibold">الرئيسية</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/campaigns">
              <span className="font-semibold">الحملات</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/donations">
              <span className="font-semibold">التبرعات</span>
            </Link>
          </li>
          <li className="mt-4">
            <Link href="/">
              <span className="text-red-600">الموقع الرئيسي</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
