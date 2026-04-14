import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // --- Validate input ---
        if (!email || !password) {
            return Response.json(
                { success: false, error: "Email and password are required." },
                { status: 400 }
            );
        }

        // --- Find user by email ---
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return Response.json(
                { success: false, error: "Invalid email or password." },
                { status: 401 }
            );
        }

        // --- Verify password with bcrypt ---
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return Response.json(
                { success: false, error: "Invalid email or password." },
                { status: 401 }
            );
        }

        // --- Generate Access Token (15m) ---
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        // --- Generate Refresh Token (24h) ---
        const refreshToken = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // --- Set HTTP-only cookies and return response ---
        const response = Response.json({
            success: true,
            message: "Login successful.",
            user: { id: user.id, name: user.name, role: user.role },
        });

        const cookieOptions = `HttpOnly; Path=/; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`;
        
        // Access token cookie (15m)
        response.headers.append(
            "Set-Cookie",
            `token=${token}; ${cookieOptions} Max-Age=${15 * 60}`
        );

        // Refresh token cookie (24h)
        response.headers.append(
            "Set-Cookie",
            `refreshToken=${refreshToken}; ${cookieOptions} Max-Age=${24 * 60 * 60}`
        );

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
