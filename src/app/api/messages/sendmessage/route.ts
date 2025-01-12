import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/index";
import MessageModel from "@/models/MessageModel";

await dbconnect();
export async function POST(req: NextRequest) {
  try {
    const {
      sentBy,
      receivedBy,
      message,
      sentByObject,
      receivedByObject,
      isDeleted,
      createdAt,
    } = await req.json();

    const msg = new MessageModel({
      sentBy,
      receivedBy,
      message,
      sentByObject,
      receivedByObject,
      isDeleted,
      createdAt,
    });
    const messageSaved = await msg.save();

    if (messageSaved) {
      return NextResponse.json({
        msg: "Message sent",
        statusCode: 200,
        messageSaved,
      });
    }
    return NextResponse.json({
      msg: "Message not sent",
      statusCode: 204,
    });
  } catch (error: any) {
    console.log("Error in db at server.js");
    return NextResponse.json({
      msg: "Message not sent",
      statusCode: 204,
      error,
    });
  }
}
