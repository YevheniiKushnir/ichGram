import { CorsOptions } from "cors";
import { env } from "./env";

export const configureCors = (): CorsOptions => {
  const clientHost =
    env.NODE_ENV === "development" ? env.FRONTEND_URL : env.CLIENT_HOST;

  if (!clientHost) {
    throw new Error(
      "CLIENT_HOST is not defined. Check your environment variables."
    );
  }

  return {
    origin: clientHost,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  };
};
