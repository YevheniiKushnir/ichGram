import { User, IUser } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import bcrypt from "bcryptjs";
import ms from "ms";
import { env } from "../config/env";
import { randomBytes } from "crypto";
import { Types } from "mongoose";
import { LoginCredentials, RegisterData } from "../types/auth";
import { AppError } from "../utils/AppError";

export class AuthService {
  private static readonly PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

  static validatePassword(password: string): void {
    if (!this.PASSWORD_REGEX.test(password)) {
      throw new AppError(
        "Password must contain at least 8 characters including uppercase, lowercase, number, and special character",
        400
      );
    }
  }

  static async checkUniqueFields(
    email: string,
    username: string
  ): Promise<void> {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError("Email already exists", 400);
      }
      if (existingUser.username === username) {
        throw new AppError("Username already exists", 400);
      }
    }
  }

  static async register(
    userData: RegisterData
  ): Promise<{ user: IUser; refreshToken: string }> {
    await this.checkUniqueFields(userData.email, userData.username);
    this.validatePassword(userData.password);

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    const refreshToken = await this.createRefreshToken(user._id);
    return { user, refreshToken };
  }

  static async login(
    credentials: LoginCredentials
  ): Promise<{ user: IUser; refreshToken: string }> {
    const { email, username, password, deviceId, userAgent } = credentials;

    const user = await User.findOne({
      $or: [{ email: email || "" }, { username: username || "" }],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid password", 400);
    }

    const refreshToken = await this.createRefreshToken(
      user._id,
      deviceId,
      userAgent
    );

    return { user, refreshToken };
  }

  static async createRefreshToken(
    userId: Types.ObjectId,
    deviceId?: string,
    userAgent?: string
  ): Promise<string> {
    const token = randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + ms(env.REFRESH_TOKEN_EXPIRES_IN));

    await RefreshToken.create({
      userId,
      token,
      deviceId,
      userAgent,
      expiresAt,
    });

    return token;
  }

  static async validateRefreshToken(token: string): Promise<Types.ObjectId> {
    if (!token) {
      throw new AppError("Refresh token required", 401);
    }
    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new AppError("Invalid refresh token", 401);
    }
    return refreshToken.userId;
  }

  static async logout(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  }

  static async logoutAllDevices(userId: Types.ObjectId): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  }
}
