import mongoose from "mongoose";

export async function connectToMongo() {
  try {
    await mongoose.connect("mongodb://localhost:27017/pingpong");
    console.log("Connected to Database");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
