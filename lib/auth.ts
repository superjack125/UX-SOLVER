import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

// This demo credentials flow is meant for quick local sign-in. Replace with
// your identity provider (email/SAML/OAuth) once ready.
const credentialsProvider = Credentials({
  name: "Demo",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email = credentials?.email;
    const password = credentials?.password;

    if (!email || !password) return null;

    const demoEmail = process.env.DEMO_USER_EMAIL;
    const demoPasswordHash = process.env.DEMO_USER_PASSWORD_HASH;

    if (!demoEmail || !demoPasswordHash) {
      console.warn("Missing DEMO_USER_EMAIL or DEMO_USER_PASSWORD_HASH env vars");
      return null;
    }

    const passwordMatches = await compare(password, demoPasswordHash);
    if (!passwordMatches || email.toLowerCase() !== demoEmail.toLowerCase()) {
      return null;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (existingUser) {
      return existingUser;
    }

    return prisma.user.create({ data: { email: demoEmail, name: "Demo User" } });
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [credentialsProvider],
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
