// middleware.ts

import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

// مسارات عامة لا تحتاج حماية
const publicPaths = [
  "/",
  "/campaigns",
  "/donations",
  "/auth/login",
  "/auth/register",
  "/admin/login", // صرنا نعتبر صفحة دخول المسؤول عامة
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // إذا المسار عام، نمضي
  if (
    publicPaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )
  ) {
    return NextResponse.next();
  }

  // نقرأ التوكن من ملفات الكوكيز
  const token = (await getToken({ req, secret })) as JWT | null;

  // حماية مسارات الـ Admin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // غير مسجل → تحويل مباشر إلى /admin/login
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (token.role !== "ADMIN") {
      // مسجل ولكن ليس ADMIN → الصفحة الرئيسية
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // حماية صفحة الملف الشخصي
  if (pathname === "/profile") {
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", "/profile");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // الباقي مفتوح
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
