import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    username?: string;
    imageUrl?: string;
  }
  interface Session {
    user: {
      _id?: string;
      username?: string;
      imageUrl?: string;
    } & DefaultSession["user"];
  }
}
