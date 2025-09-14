import "../config/dotenv.js";
import express from "express";
import cors from "cors";
import connectDB from "./db/index";
import serverErrorMiddleware from "./middleware/serverError";
import notFoundMiddleware from "./middleware/notFound";
import uploadRoutes from './routes/uploadRoutes';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/upload-img', uploadRoutes);

app.use(notFoundMiddleware);
app.use(serverErrorMiddleware);

const PORT = process.env.PORT || 3001;

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
