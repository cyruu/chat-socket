import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import axios from "axios";
export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("nextjs.session-token") || null;
  const publicRoutes = ["/login", "/signup"];
  // const { data: resData } = await axios.get(
  //   "http://localhost:3000/api/users/getloggedinuser"
  // );

  // const loggedin = resData.statusCode == 200;

  if (publicRoutes.includes(path) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && !publicRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/login"],
};
