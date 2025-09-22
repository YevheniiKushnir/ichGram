import "./config/env";
import express from "express";
import "express-async-errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db";
import "./types/express";

import { env } from "./config/env";
import { configureCors } from "./config/cors";

import { Server } from "socket.io";
import { setupSocketHandlers } from "./utils/websocket/socketHandlers";
import { createServer } from "http";
import { SocketService } from "./services/socketService";

import errorMiddleware from "./middleware/errorMiddleware";
import transformResponse from "./middleware/transformResponse";

import uploadRoutes from "./routes/uploadRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import commentRoutes from "./routes/commentRoutes";
import postRoutes from "./routes/postRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import chatRoutes from "./routes/chatRoutes";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Express middleware
app.use(cors(configureCors()));
app.use(express.json());
app.use(cookieParser());
app.use(transformResponse);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/upload", uploadRoutes);

app.use(errorMiddleware);

SocketService.initialize(io);
setupSocketHandlers(io);

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    httpServer.listen(PORT, () => {
      console.log(`Server running on on the  http://localhost:${PORT}/`);
      console.log(`WebSocket server ready`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { io };
