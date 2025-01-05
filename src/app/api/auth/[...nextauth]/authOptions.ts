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
            userEmail: userCheck.email,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "nextjs.session-token",
      options: {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
};
