import { dbconnect } from "@/index";
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/UserModel";

await dbconnect();
export async function GET(request: NextRequest) {
  try {
    const allUsers = await UserModel.find({}).select("-password");
    if (allUsers) {
      return NextResponse.json({
        msg: "all users found",
        statusCode: 200,
        allUsers,
      });
    }
    return NextResponse.json({
      msg: "all users not found",
      statusCode: 204,
    });
  } catch (error: any) {
    console.log("internal error getallusers", error);
    return NextResponse.json({
      msg: "internal error in getallusers",
      statusCode: 204,
      error,
    });
  }
}
