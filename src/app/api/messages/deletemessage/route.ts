import { NextRequest, NextResponse } from "next/server";
import MessageModel from "@/models/MessageModel";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const message = await request.json();

    const { _id, createdAt } = message;

    console.log(createdAt);

    const dbMessage = await MessageModel.findOne({
      createdAt,
    });
    dbMessage.isDeleted = true;
    const deleted = await dbMessage.save();
    if (deleted) {
      return NextResponse.json({
        msg: "Message deleted",
        statusCode: 200,
        _id,
      });
    }
    return NextResponse.json({
      msg: "Failed to delete message",
      statusCode: 204,
      _id,
    });
  } catch (error) {
    console.log("internal error delete message", error);
    return NextResponse.json({
      msg: "internal error delete message",
      statusCode: 204,
      error,
    });
  }
}
