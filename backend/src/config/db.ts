import mongoose from "mongoose";
import { env } from "./env";

const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URL) {
    throw new Error("MONGO_URL is not defined in environment variables");
  }

  await mongoose.connect(env.MONGO_URL, {
    dbName: env.MONGO_DB_NAME,
  });
};

export default connectDB;
