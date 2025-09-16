import { User, IUser } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Types } from "mongoose";
import { LoginCredentials, RegisterData } from "../types/auth";

export class AuthService {
  private static readonly PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

  private static validatePassword(password: string): void {
    if (!this.PASSWORD_REGEX.test(password)) {
      throw new Error(
        "Password must contain at least 8 characters including uppercase, lowercase, number, and special character"
      );
    }
  }

  private static async checkUniqueFields(
    email: string,
    username: string
  ): Promise<void> {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email already exists");
      }
      if (existingUser.username === username) {
        throw new Error("Username already exists");
      }
    }
  }

  static async register(
    userData: RegisterData
  ): Promise<{ user: IUser; refreshToken: string }> {
    this.validatePassword(userData.password);
    await this.checkUniqueFields(userData.email, userData.username);

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    const refreshToken = await this.createRefreshToken(user._id.toString());
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
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    const refreshToken = await this.createRefreshToken(
      user._id.toString(),
      deviceId,
      userAgent
    );

    return { user, refreshToken };
  }

  static async createRefreshToken(
    userId: string,
    deviceId?: string,
    userAgent?: string
  ): Promise<string> {
    const token = randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: new Types.ObjectId(userId),
      token,
      deviceId,
      userAgent,
      expiresAt,
    });

    return token;
  }

  static async validateRefreshToken(token: string): Promise<string | null> {
    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return null;
    }
    return refreshToken.userId.toString();
  }

  static async logout(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  }

  static async logoutAllDevices(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ userId: new Types.ObjectId(userId) });
  }
}
