// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "../../../lib/prisma";

const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
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
        adminLogin: { label: "AdminLogin", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password required");
        }

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

        const isAdminAttempt = credentials.adminLogin === "true";

        // منع دخول ADMIN عبر صفحة المستخدم العادية
        if (!isAdminAttempt && user.role === "ADMIN") {
          throw new Error("Not authorized");
        }
        // منع دخول USER عبر صفحة المسؤول
        if (isAdminAttempt && user.role !== "ADMIN") {
          throw new Error("Not authorized");
        }

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
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.thumbnailUrl = (user as any).thumbnailUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).thumbnailUrl = token.thumbnailUrl;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// لا نصدر authOptions كي لا تظهر كـ export غير مسموح به في مسار الـ API
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
