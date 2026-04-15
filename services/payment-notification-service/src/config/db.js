import mongoose from "mongoose";
import config from "./env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log("Payment-Notification service connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
