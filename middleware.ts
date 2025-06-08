// middleware.ts

import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

// قائمة المسارات التي لا تحتاج إلى حماية
const publicPaths = [
  "/", // الصفحة الرئيسية
  "/campaigns", // عرض الحملات
  "/campaigns/", // حملات تحت مسارات فرعية
  "/donations", // صفحة التبرعات
  "/donations/", // تبرعات فرعية
  "/auth/login", // تسجيل الدخول
  "/auth/register", // التسجيل
  "/admin/login", // صفحة تسجيل دخول الإدارة (عام)
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // إذا كان المسار أحد المسارات العامة، نسمح بالوصول مباشرة
  if (
    publicPaths.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // نحاول قراءة JWT من الكوكيز باستخدام next-auth
  const token = (await getToken({ req, secret })) as JWT | null;

  // ————————————
  // حماية مسارات الإدارة (/admin)
  // ————————————
  if (pathname.startsWith("/admin")) {
    // إذا لم يكن هناك توكن، أعِد توجيه المستخدم إلى صفحة تسجيل دخول الإدارة
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // إذا كان لديه توكن لكن ليس بدور ADMIN، نعيده إلى الصفحة الرئيسية
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // التأكد أن المستخدم Admin — نسمح بالدخول
    return NextResponse.next();
  }

  // ————————————
  // حماية صفحة الملف الشخصي (مثال لمسار يتطلب تسجيل دخول)
  // ————————————
  if (pathname === "/profile") {
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      // بعد تسجيل الدخول نرجع للمسار الأصلي
      loginUrl.searchParams.set("callbackUrl", "/profile");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // إذا لم ينطبق شيء مما سبق، نسمح بالدخول
  return NextResponse.next();
}

// نطبق الـ middleware على كل المسارات (عدا ملفات النظام والصور والـfavicon)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
