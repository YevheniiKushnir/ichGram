import { Response } from "express";
import { env } from "../config/env";
import ms, { StringValue } from "ms";

export class Cookie {
  private static readonly isProd: boolean = env.NODE_ENV === "production";
  private static readonly maxAgeAccessToken = ms(
    env.ACCESS_TOKEN_EXPIRES_IN as StringValue
  );
  private static readonly maxAgeRefreshToken = ms(
    env.REFRESH_TOKEN_EXPIRES_IN as StringValue
  );

  static setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: "strict",
      maxAge: this.maxAgeAccessToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: "strict",
      maxAge: this.maxAgeRefreshToken,
    });
  }

  static clearAuthCookies(res: Response): void {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }
}
