import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("starting getloggedinuer get api");
    // const loginCookie = req.cookies.get("loginCookie") || true;

    // await new Promise((res, rej) => {
    //   setTimeout(() => {
    //     res("ad");
    //   }, 1000);
    // });
    // if (loginCookie) {
    //   return NextResponse.json({
    //     loggedInUser: { username: "cy", uid: 123 },
    //     statusCode: 200,
    //     msg: "loggedInUser found",
    //   });
    // }
    return NextResponse.json({
      loggedInUser: { username: "cy", uid: 123 },
      statusCode: 201,
      msg: "loggedInUse not found",
    });
  } catch (error) {
    console.log("internal error in getloggedinuser route: ", error);

    return NextResponse.json({
      loggedInUser: null,
      statusCode: 201,
      msg: error,
    });
  }
}
