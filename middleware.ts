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
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // إذا المسار ضمن العامة، نمضي قدماً
  if (
    publicPaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )
  ) {
    return NextResponse.next();
  }

  const token = (await getToken({ req, secret })) as JWT | null;

  // مسارات المسؤول
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // غير مسجل → إعادة توجيه لتسجيل الدخول
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", "/admin");
      return NextResponse.redirect(url);
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // مسار الملف الشخصي
  if (pathname === "/profile") {
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", "/profile");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // باقي المسارات مفتوحة للجميع
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
