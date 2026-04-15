import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json(
                { success: false, error: "Email is required." },
                { status: 400 }
            );
        }

        // --- Find user by email ---
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return Response.json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }

        // --- Generate a reset token (valid for 15 minutes) ---
        const resetToken = jwt.sign(
            { id: user.id, email: user.email, purpose: "password-reset" },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        // --- Build reset URL ---
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        // --- Send email ---
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD, // Gmail App Password
            },
        });

        await transporter.sendMail({
            from: `"Madrasa Karam Khan" <${process.env.SMTP_EMAIL}>`,
            to: user.email,
            subject: "Password Reset Request — Madrasa Karam Khan",
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f17; color: #e8e8ed; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); width: 52px; height: 52px; border-radius: 14px; line-height: 52px; font-size: 22px; color: white; margin-bottom: 12px;">📖</div>
                        <h2 style="margin: 0; font-size: 20px; background: linear-gradient(135deg, #c9a84c, #e8d48b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Madrasa Karam Khan</h2>
                    </div>

                    <p style="font-size: 15px; color: #a1a1aa; margin-bottom: 6px;">Assalamu Alaikum <strong style="color: #e8e8ed;">${user.name}</strong>,</p>
                    <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin-bottom: 24px;">
                        We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong style="color: #fbbf24;">15 minutes</strong>.
                    </p>

                    <div style="text-align: center; margin-bottom: 28px;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0f0f17; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 36px; border-radius: 12px; letter-spacing: 0.3px;">Reset Password</a>
                    </div>

                    <p style="font-size: 12px; color: #52525b; line-height: 1.5; margin-bottom: 16px;">
                        If you didn't request this, you can safely ignore this email. Your password won't be changed.
                    </p>

                    <hr style="border: none; border-top: 1px solid #27272a; margin: 20px 0;" />
                    <p style="font-size: 11px; color: #3f3f46; text-align: center;">
                        This is an automated message from Madrasa Karam Khan Attendance System.
                    </p>
                </div>
            `,
        });

        return Response.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return Response.json(
            { success: false, error: "Failed to process your request. Please try again." },
            { status: 500 }
        );
    }
}
