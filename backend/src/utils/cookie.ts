import { Response } from "express";
import { env } from "../config/env";

const isProd: boolean = env.NODE_ENV === "production";
const maxAgeAccessToken: number = 15 * 60 * 1000; //15m
const maxAgeRefreshToken: number = 7 * 24 * 60 * 60 * 1000; //7d

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: maxAgeAccessToken,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: maxAgeRefreshToken,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
