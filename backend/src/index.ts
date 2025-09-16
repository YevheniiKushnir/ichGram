import "./config/env";
import express from "express";
import cors from "cors";
import connectDB from "./config/db";

import { env } from "./config/env";
import { configureCors } from "./config/cors";

import errorMiddleware from "./middleware/errorMiddleware";

import uploadRoutes from "./routes/uploadRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(cors(configureCors()));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.use(errorMiddleware);

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on on the  http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
