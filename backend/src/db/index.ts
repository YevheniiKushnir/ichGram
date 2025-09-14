import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.MONGO_DB_NAME;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in environment variables");
  }

  await mongoose.connect(mongoUrl, {
    dbName: dbName || "instagram_clone",
  });
};

export default connectDB;
