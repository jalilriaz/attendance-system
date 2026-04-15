import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return Response.json(
                { success: false, error: "Token and new password are required." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return Response.json(
                { success: false, error: "Password must be at least 6 characters." },
                { status: 400 }
            );
        }

        // --- Verify the reset token ---
        let payload: jwt.JwtPayload;
        try {
            payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        } catch {
            return Response.json(
                { success: false, error: "Invalid or expired reset link. Please request a new one." },
                { status: 401 }
            );
        }

        // --- Ensure the token was issued for password reset ---
        if (payload.purpose !== "password-reset" || !payload.id) {
            return Response.json(
                { success: false, error: "Invalid reset token." },
                { status: 401 }
            );
        }

        // --- Find the user ---
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
        });

        if (!user) {
            return Response.json(
                { success: false, error: "User not found." },
                { status: 404 }
            );
        }

        // --- Hash the new password and update ---
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return Response.json({
            success: true,
            message: "Password reset successfully. You can now sign in with your new password.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return Response.json(
            { success: false, error: "Failed to reset password. Please try again." },
            { status: 500 }
        );
    }
}
