import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    console.log("in getuser route");
    // const count = window.localStorage.get("count");
    return NextResponse.json({ status: 200, count: 99 });
  } catch (error) {
    console.log("error in getuser route", error);
  }
}
