import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // ── Auth: Admin only ──────────────────────────
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }

        const { title, date } = await request.json();

        // ── Validate input ────────────────────────────
        if (!title || !date) {
            return Response.json(
                { success: false, error: "Title and date are required." },
                { status: 400 }
            );
        }

        const holidayDate = new Date(date);
        if (isNaN(holidayDate.getTime())) {
            return Response.json(
                { success: false, error: "Invalid date format. Use YYYY-MM-DD." },
                { status: 400 }
            );
        }

        // Normalize to UTC midnight for @db.Date
        const holidayDateUTC = new Date(
            Date.UTC(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate())
        );

        // ── Block: Duplicate holiday ──────────────────
        const existing = await prisma.holiday.findUnique({
            where: { date: holidayDateUTC },
        });

        if (existing) {
            return Response.json(
                { success: false, error: `A holiday already exists on this date: ${existing.title}.` },
                { status: 400 }
            );
        }

        // ── Create holiday ────────────────────────────
        const holiday = await prisma.holiday.create({
            data: {
                title,
                date: holidayDateUTC,
            },
        });

        return Response.json({
            success: true,
            message: "Holiday added successfully.",
            holiday,
        });
    } catch (error) {
        console.error("Holiday creation error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}

// ── GET: List all holidays ────────────────────────
export async function GET() {
    try {
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }

        const holidays = await prisma.holiday.findMany({
            orderBy: { date: "asc" },
        });

        return Response.json({ success: true, holidays });
    } catch (error) {
        console.error("Holiday list error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
