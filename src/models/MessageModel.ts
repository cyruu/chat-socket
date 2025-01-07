import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sentBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    receivedBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    message: {
      type: String,
    },
    sentByObject: {
      type: Object,
    },
    receivedByObject: {
      type: Object,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Define the Message model (with capitalization)
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
