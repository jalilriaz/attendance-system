import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        const user = await getUserFromToken();
        if (!user) {
            return Response.json({ success: false, error: "Unauthorized." }, { status: 401 });
        }

        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Karachi",
            year: "numeric",
            month: "numeric",
        });
        const parts = formatter.formatToParts(now);
        const y = parseInt(parts.find(p => p.type === "year")!.value);
        const m = parseInt(parts.find(p => p.type === "month")!.value);

        const monthStart = new Date(Date.UTC(y, m - 1, 1));
        const monthEnd = new Date(Date.UTC(y, m, 0));

        const paidLeavesThisMonth = await prisma.leave.findMany({
            where: {
                userId: user.id,
                date: { gte: monthStart, lte: monthEnd },
                status: { in: ["Pending", "Approved"] },
                type: "Paid",
            },
            select: { date: true },
        });

        const paidLeaveDates = paidLeavesThisMonth.map(l => l.date.toISOString().split("T")[0]);

        const holidaysThisMonth = await prisma.holiday.findMany({
            where: { date: { gte: monthStart, lte: monthEnd } },
        });
        const holidayDates = new Set(holidaysThisMonth.map(h => h.date.toISOString().split("T")[0]));

        const effectivePaidLeavesUsed = paidLeaveDates.filter(ld => !holidayDates.has(ld)).length;

        return Response.json({
            success: true,
            paidLeavesUsed: effectivePaidLeavesUsed,
        });
    } catch (error) {
        return Response.json({ success: false, error: "Internal server error." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // ── Auth ──────────────────────────────────────
        const user = await getUserFromToken();
        if (!user) {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        const { date, reason } = await request.json();

        // ── Validate input ────────────────────────────
        if (!date || !reason) {
            return Response.json(
                { success: false, error: "Date and reason are required." },
                { status: 400 }
            );
        }

        // ── Parse and validate date ───────────────────
        const leaveDate = new Date(date);
        if (isNaN(leaveDate.getTime())) {
            return Response.json(
                { success: false, error: "Invalid date format. Use YYYY-MM-DD." },
                { status: 400 }
            );
        }

        // Normalize to UTC midnight for @db.Date
        const leaveDateUTC = new Date(
            Date.UTC(leaveDate.getFullYear(), leaveDate.getMonth(), leaveDate.getDate())
        );

        // ── Block: Sunday ─────────────────────────────
        if (leaveDateUTC.getUTCDay() === 0) {
            return Response.json(
                { success: false, error: "Cannot apply for leave on a Sunday. It's already a day off." },
                { status: 400 }
            );
        }

        // ── Block: Holiday ────────────────────────────
        const holiday = await prisma.holiday.findUnique({
            where: { date: leaveDateUTC },
        });

        if (holiday) {
            return Response.json(
                { success: false, error: `Cannot apply for leave on ${holiday.title}. It's already a holiday.` },
                { status: 400 }
            );
        }

        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Karachi",
            year: "numeric",
            month: "numeric",
        });
        const parts = formatter.formatToParts(now);
        const y = parseInt(parts.find(p => p.type === "year")!.value);
        const m = parseInt(parts.find(p => p.type === "month")!.value);

        const monthStart = new Date(Date.UTC(y, m - 1, 1));
        const monthEnd = new Date(Date.UTC(y, m, 0));

        const paidLeavesThisMonth = await prisma.leave.findMany({
            where: {
                userId: user.id,
                date: { gte: monthStart, lte: monthEnd },
                status: { in: ["Pending", "Approved"] },
                type: "Paid",
            },
            select: { date: true }
        });

        const paidLeaveDates = paidLeavesThisMonth.map(l => l.date.toISOString().split("T")[0]);

        const holidaysThisMonth = await prisma.holiday.findMany({
            where: { date: { gte: monthStart, lte: monthEnd } },
        });
        const holidayDates = new Set(holidaysThisMonth.map(h => h.date.toISOString().split("T")[0]));

        const effectivePaidLeavesUsed = paidLeaveDates.filter(ld => !holidayDates.has(ld)).length;

        const leaveType = effectivePaidLeavesUsed < 2 ? "Paid" : "Unpaid";

        // ── Block: Duplicate leave ────────────────────
        const existingLeave = await prisma.leave.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: leaveDateUTC,
                },
            },
        });

        if (existingLeave) {
            return Response.json(
                { success: false, error: `You already have a leave request for this date (status: ${existingLeave.status}).` },
                { status: 400 }
            );
        }

        // ── Create leave request ──────────────────────
        const leave = await prisma.leave.create({
            data: {
                userId: user.id,
                date: leaveDateUTC,
                reason,
                status: "Pending",
                type: leaveType,
            },
        });

        return Response.json({
            success: true,
            message: `Leave request submitted successfully as ${leaveType}.`,
            leave,
        });
    } catch (error) {
        console.error("Leave request error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
