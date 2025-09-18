import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthService } from "../services/authService";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthRequest,
} from "../types/auth";
import { setAuthCookies, clearAuthCookies } from "../utils/cookie";
import { getUserId } from "../utils/checkAuth";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
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
        { expiresIn: "15m" }
      );
      setAuthCookies(res, accessToken, refreshToken);

      const response: AuthResponse = {
        user: {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        },
      };

      res.status(201).json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        username,
        password,
        deviceId,
        userAgent,
      }: LoginCredentials = req.body;

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
        { expiresIn: "15m" }
      );

      setAuthCookies(res, accessToken, refreshToken);

      const response: AuthResponse = {
        user: {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        },
      };

      res.json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(401).json({ error: message });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: "Refresh token required" });
        return;
      }

      const userId = await AuthService.validateRefreshToken(refreshToken);
      if (!userId) {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }

      const newAccessToken = jwt.sign({ userId }, env.JWT_SECRET!, {
        expiresIn: "15m",
      });

      const newRefreshToken = await AuthService.createRefreshToken(userId);

      setAuthCookies(res, newAccessToken, newRefreshToken);

      res.json({ message: "Tokens refreshed" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(401).json({ error: message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      clearAuthCookies(res);

      res.json({ message: "Logged out successfully" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  }
  static async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req as AuthRequest);
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      clearAuthCookies(res);

      await AuthService.logoutAllDevices(userId);

      res.json({ message: "Logged out from all devices" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  }
}
