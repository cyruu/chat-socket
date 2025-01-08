import { dbconnect } from "@/index";
import { NextRequest, NextResponse } from "next/server";
import MessageModel from "@/models/MessageModel";

await dbconnect();
export async function POST(request: NextRequest) {
  try {
    const { sentBy } = await request.json();

    const allMessages = await MessageModel.find({
      $or: [{ sentBy: sentBy }, { receivedBy: sentBy }],
    });

    return NextResponse.json({
      allMessages,
      statusCode: 200,
      msg: "Got users all messages",
    });
  } catch (error) {
    console.log("internal err getusermessages route", error);

    return NextResponse.json({
      error,
      statusCode: 204,
      msg: "internal error getusermessages route",
    });
  }
}
