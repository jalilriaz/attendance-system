import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
    id: string;
    role: string;
}

/**
 * Extracts and verifies the user from the JWT cookie.
 * Returns the decoded payload or null if invalid/missing.
 */
export async function getUserFromToken(): Promise<JwtPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return payload;
    } catch {
        return null;
    }
}

/**
 * Returns today's date as a UTC Date object with time set to 00:00:00.
 * Used for querying @db.Date columns in Prisma.
 */
export function getTodayDateUTC(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
