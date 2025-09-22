import nodemailer from "nodemailer";
import { env } from "../config/env";

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail", 
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
