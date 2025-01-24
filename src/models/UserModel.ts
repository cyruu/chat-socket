import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    imageUrl: {
      type: String,
    },
    isadmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Define the User model (with capitalization)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
