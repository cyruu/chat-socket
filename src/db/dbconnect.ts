import mongoose from "mongoose";

export async function dbconnect() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    const conn = mongoose.connection;
    conn.on("connected", () => console.log("connected to mongodb"));
    conn.on("error", () => console.log("failed to connect"));
  } catch (error) {
    console.log(error);
  }
}
