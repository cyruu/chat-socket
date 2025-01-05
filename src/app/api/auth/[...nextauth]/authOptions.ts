import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
          const { username, password } = credentials;
          if (["cyrus", "mhr", "aqua"].includes(username)) {
            const user = { _id: username + "101", username };
            return user;
          } else {
            throw new Error("Invalid Username");
          }
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
