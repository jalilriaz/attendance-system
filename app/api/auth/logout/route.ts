import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully",
    });

    response.cookies.set("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return response;
}
