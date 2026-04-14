import { prisma } from "@/lib/prisma";
import { getUserFromToken, getTodayDateUTC } from "@/lib/auth";
import { processAutoAbsences } from "@/lib/attendance";

export async function POST() {
    try {
        // ── Auth ──────────────────────────────────────
        const user = await getUserFromToken();
        if (!user) {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        const now = new Date();
        const todayUTC = getTodayDateUTC();
        const dayOfWeek = now.getDay(); // 0 = Sunday

        // ── Trigger Lazy Evaluation ─────────────────────
        // Ensure that any overdue absences (after 12 PM) are recorded first.
        await processAutoAbsences();

        // ── Block: Sunday ─────────────────────────────
        if (dayOfWeek === 0) {
            return Response.json(
                { success: false, error: "Cannot check in on Sunday. It's a day off." },
                { status: 400 }
            );
        }

        // ── Block: Holiday ────────────────────────────
        const holiday = await prisma.holiday.findUnique({
            where: { date: todayUTC },
        });

        if (holiday) {
            return Response.json(
                { success: false, error: `Cannot check in. Today is a holiday: ${holiday.title}.` },
                { status: 400 }
            );
        }

        // ── Block: Approved Leave ─────────────────────
        const leave = await prisma.leave.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: todayUTC,
                },
            },
        });

        if (leave && leave.status === "Approved") {
            return Response.json(
                { success: false, error: "Cannot check in. You have an approved leave for today." },
                { status: 400 }
            );
        }

        // ── Block: Already checked in ─────────────────
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: todayUTC,
                },
            },
        });

        if (existingAttendance) {
            // Check if this is the auto-generated absent record for missing the 12 PM deadline
            if (existingAttendance.status === "Absent") {
                return Response.json(
                    { success: false, error: "Check-in disabled. You failed to check in by 12:00 PM and have been marked Absent. Please contact the Admin." },
                    { status: 400 }
                );
            }

            return Response.json(
                { success: false, error: "You have already checked in today." },
                { status: 400 }
            );
        }

        // ── Determine status: Late if after 8:15 AM ───
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isLate = hours > 8 || (hours === 8 && minutes > 15);
        const status = isLate ? "Late" : "Present";

        // ── Create Attendance record ──────────────────
        const attendance = await prisma.attendance.create({
            data: {
                userId: user.id,
                date: todayUTC,
                checkIn: now,
                status,
            },
        });

        return Response.json({
            success: true,
            message: `Checked in successfully. Status: ${status}.`,
            attendance,
        });
    } catch (error) {
        console.error("Check-in error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
