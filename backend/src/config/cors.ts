import { CorsOptions } from "cors";
import { env } from "./env";

export const configureCors = (): CorsOptions => {
  const clientHost =
    env.NODE_ENV === "development" ? "http://localhost:5173" : env.CLIENT_HOST;

  if (!clientHost) {
    throw new Error(
      "CLIENT_HOST is not defined. Check your environment variables."
    );
  }

  return {
    origin: [clientHost, "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    credentials: true,
  };
};
