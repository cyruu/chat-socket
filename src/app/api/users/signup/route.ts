import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/index";
import bcryptjs from "bcryptjs";
import UserModel from "@/models/UserModel";

export async function POST(req: NextRequest) {
  try {
    await dbconnect();
    const { email, username, password, imageUrl } = await req.json();
    console.log("signup route", email, username, imageUrl, password);

    // check email
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return NextResponse.json({
        msg: "Email already exists",
        statusCode: 204,
      });
    }
    const userExists = await UserModel.findOne({ username });
    if (userExists) {
      return NextResponse.json({ msg: "User already exists", statusCode: 204 });
    }
    //hashing
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const newUser = new UserModel({
      username,
      email,
      imageUrl,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    return NextResponse.json({
      msg: "New user created",
      statusCode: 200,
    });
  } catch (err: any) {
    console.log("Internal err signup route", err);

    return NextResponse.json({
      error: err,
      msg: "Internal error signup route",
      statusCode: 204,
    });
  }
}
