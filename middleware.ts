import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const protectedRoutes: Record<string, string> = {
    "/teacher": "teacher",
    "/admin": "admin",
};

/**
 * Attempt to extract a valid JWT payload from the access token or refresh token.
 * Returns { payload, needsNewToken } or null if both are invalid/missing.
 */
async function resolveAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // 1. Try Access Token first
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            return { payload, needsNewToken: false };
        } catch {
            // expired or invalid — fall through to refresh
        }
    }

    // 2. Fallback to Refresh Token
    if (refreshToken) {
        try {
            const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
            return { payload, needsNewToken: true };
        } catch {
            // expired or invalid
        }
    }

    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ─── Guard: Redirect logged-in users AWAY from /login & password routes ───
    if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password") {
        const auth = await resolveAuth(request);
        if (auth) {
            const role = auth.payload.role as string;
            const destination = role === "admin" ? "/admin" : "/teacher";
            return NextResponse.redirect(new URL(destination, request.url));
        }
        return NextResponse.next();
    }

    // ─── Guard: Protect portal routes from unauthenticated users ───
    const matchedRoute = Object.keys(protectedRoutes).find((route) => pathname.startsWith(route));
    if (!matchedRoute) return NextResponse.next();

    const requiredRole = protectedRoutes[matchedRoute];
    const auth = await resolveAuth(request);

    // No valid session at all → kick to landing page
    if (!auth) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Valid session but wrong role → kick to landing page
    if (auth.payload.role !== requiredRole) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.next();

    // Silently rotate a new 15m Access Token if we used the Refresh Token
    if (auth.needsNewToken) {
        const newToken = await new SignJWT({ id: auth.payload.id, role: auth.payload.role })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(JWT_SECRET);

        response.cookies.set("token", newToken, {
            httpOnly: true,
            path: "/",
            maxAge: 15 * 60,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }

    return response;
}

export const config = {
    matcher: ["/login", "/forgot-password", "/reset-password", "/teacher/:path*", "/admin/:path*"],
};
