import dotenv from "dotenv";
import { StringValue } from "ms";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URL: process.env.MONGO_URL,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "instagram_clone",

  EMAIL_USER: process.env.EMAIL_USER || "yourEmail@gmail.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "yourPassword",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  JWT_SECRET: process.env.JWT_SECRET || "fallback_dev_secret",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "fallback_dev_refresh_secret",
  ACCESS_TOKEN_EXPIRES_IN: "15m" as StringValue, //format jwt expires_in
  REFRESH_TOKEN_EXPIRES_IN: "7d" as StringValue, //format jwt expires_in
  RESET_TOKEN_EXPIRES_IN: "15m" as StringValue, //format jwt expires_in

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,

  CLIENT_HOST: "",
};
