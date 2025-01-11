import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const loginCookie = request.cookies.get("nextjs.session-token") || null;
    if (loginCookie) {
      const response = NextResponse.json({
        msg: "Logout successful",
        statusCode: 200,
      });

      response.cookies.set("nextjs.session-token", "", {
        expires: new Date(0),
      });

      return response;
    }
    return NextResponse.json({
      msg: "Failed to logout",
      statusCode: 204,
    });
  } catch (error) {
    console.log("internal error logout route", error);
    return NextResponse.json({
      msg: "Internal error logut route",
      statusCode: 204,
      error,
    });
  }
}
