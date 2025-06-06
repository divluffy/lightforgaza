// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password required");
        }

        // جلب المستخدم كاملًا من قاعدة البيانات
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with that email");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // نُعيد كل الحقول المطلوبة (كمثال: phone, nationalId, dateOfBirth, governorate، createdAt، updatedAt)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          thumbnailUrl: user.thumbnailUrl,
          phone: user.phone,
          nationalId: user.nationalId,
          dateOfBirth: user.dateOfBirth.toISOString(),
          governorate: user.governorate,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    // إضافة الحقول الإضافية إلى الـ JWT عند تسجيل الدخول
    async jwt({ token, user }) {
      if (user) {
        // عند تسجيل الدخول لأول مرة، user سيحوي كل الحقول التي رجعناها في authorize()
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.email = (user as any).email;
        token.role = (user as any).role;
        token.thumbnailUrl = (user as any).thumbnailUrl;
        token.phone = (user as any).phone;
        token.nationalId = (user as any).nationalId;
        token.dateOfBirth = (user as any).dateOfBirth;
        token.governorate = (user as any).governorate;
        token.createdAt = (user as any).createdAt;
        token.updatedAt = (user as any).updatedAt;
      }
      return token;
    },

    // بناء كائن session.user ليحتوي على جميع الحقول
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).thumbnailUrl = token.thumbnailUrl as string;
        (session.user as any).phone = token.phone as string;
        (session.user as any).nationalId = token.nationalId as string;
        (session.user as any).dateOfBirth = token.dateOfBirth as string;
        (session.user as any).governorate = token.governorate as string;
        (session.user as any).createdAt = token.createdAt as string;
        (session.user as any).updatedAt = token.updatedAt as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
