// src/lib/auth.ts
import { getServerSession as _getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import { authOptions } from "../api/auth/[...nextauth]";

// للحصول على الجلسة في الـ API routes أو getServerSideProps
export async function getServerAuthSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await _getServerSession(req, res, authOptions);
}

// للحصول على الجلسة في getServerSideProps ضمن صفحات Next.js
export async function getServerAuthSessionPage(ctx: NextPageContext) {
  const { req, res } = ctx;
  return await _getServerSession(req as any, res as any, authOptions);
}
