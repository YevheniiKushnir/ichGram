import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthService } from "../services/authService";
import { LoginCredentials, RegisterData, AuthResponse } from "../types/auth";
import { Cookie } from "../utils/cookie";
import { Types } from "mongoose";
import { AuthUtils } from "../utils/authUtils";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { username, email, password, fullName }: RegisterData = req.body;

    const { user, refreshToken } = await AuthService.register({
      username,
      email,
      password,
      fullName,
    });

    const accessToken = jwt.sign(
      { userId: user._id.toString() },
      env.JWT_SECRET!,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
    );
    Cookie.setAuthCookies(res, accessToken, refreshToken);

    const response: AuthResponse = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    };

    res.status(201).json(response);
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, username, password, deviceId, userAgent }: LoginCredentials =
      req.body;

    const { user, refreshToken } = await AuthService.login({
      email,
      username,
      password,
      deviceId,
      userAgent,
    });

    const accessToken = jwt.sign(
      { userId: user._id.toString() },
      env.JWT_SECRET!,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
    );

    Cookie.setAuthCookies(res, accessToken, refreshToken);

    const response: AuthResponse = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    };

    res.json(response);
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;

    const userId = await AuthService.validateRefreshToken(refreshToken);

    const newAccessToken = jwt.sign(
      { userId: userId.toString() },
      env.JWT_SECRET!,
      {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
      }
    );

    const newRefreshToken = await AuthService.createRefreshToken(userId);

    Cookie.setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({ message: "Tokens refreshed" });
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    Cookie.clearAuthCookies(res);

    res.json({ message: "Logged out successfully" });
  }

  static async logoutAll(req: Request, res: Response): Promise<void> {
    const userId = AuthUtils.getUserId(req);

    Cookie.clearAuthCookies(res);

    await AuthService.logoutAllDevices(new Types.ObjectId(userId));

    res.json({ message: "Logged out from all devices" });
  }
}
