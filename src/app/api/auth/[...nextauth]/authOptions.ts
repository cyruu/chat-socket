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
          if (username == "cy") {
            const user = { _id: "101", username };
          }
        } catch (e: any) {
          throw new Error("Internal Error: next-authorize");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return token;
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
};
