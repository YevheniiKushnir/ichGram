import { env } from "../config/env";
import { cloudinary } from "../config/cloudinary";

export const CloudinaryService = {
  generateSignature: () => {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
      },
      env.CLOUDINARY_API_SECRET!
    );
    return { signature, timestamp, api_key: env.CLOUDINARY_API_KEY };
  },
};
