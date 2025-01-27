import { dbconnect } from "@/index";
import { NextAuthOptions } from "next-auth";
import bcryptjs from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "@/models/UserModel";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "username", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          await dbconnect();
          const { username, password } = credentials;

          const userCheck = await UserModel.findOne({ username });
          if (!userCheck) {
            throw new Error("Invalid user");
          }
          const hashedCorrect = await bcryptjs.compare(
            password,
            userCheck.password
          );
          if (!hashedCorrect) {
            throw new Error("Incorrect password");
          }
          const user = {
            _id: userCheck._id,
            username: userCheck.username,
            email: userCheck.email,
            imageUrl: userCheck.imageUrl,
            isadmin: userCheck.isadmin,
          };
          return user;
        } catch (e: any) {
          throw new Error(e.message || "Internal Error: next-authorize");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.username = user.username;
        token.imageUrl = user.imageUrl;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string;
        session.user.username = token.username as string;
        session.user.imageUrl = token.imageUrl as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  cookies: {
    sessionToken: {
      name: "nextjs.session-token",
      options: {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
};
