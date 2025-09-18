import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URL: process.env.MONGO_URL,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "instagram_clone",

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  JWT_SECRET: process.env.JWT_SECRET || "fallback_dev_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "fallback_dev_refresh_secret",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,

  CLIENT_HOST:"",
};
