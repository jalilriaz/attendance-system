import { prisma } from "@/lib/prisma";
import { getUserFromToken, getTodayDateUTC } from "@/lib/auth";

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
        const dayOfWeek = now.getDay(); // 0=Sun, 5=Fri

        // ── Find today's attendance record ────────────
        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: todayUTC,
                },
            },
        });

        if (!attendance) {
            return Response.json(
                { success: false, error: "No check-in record found for today." },
                { status: 404 }
            );
        }

        if (attendance.checkOut) {
            return Response.json(
                { success: false, error: "You have already checked out today." },
                { status: 400 }
            );
        }

        // ── Check if today is a custom holiday ──────────
        const isSunday = dayOfWeek === 0;
        const holiday = await prisma.holiday.findFirst({
            where: { date: todayUTC },
        });

        const checkInTime = new Date(attendance.checkIn!);
        const diffMs = now.getTime() - checkInTime.getTime();
        const workingMinutes = Math.floor(diffMs / (1000 * 60));
        const workingHours = parseFloat((workingMinutes / 60).toFixed(2));

        // ── Calculate expected minutes and deficit ────
        let expectedMinutes = 420; // 7 hours default
        if (isSunday || holiday) {
            expectedMinutes = 0; // Off days have no required hours
        } else if (dayOfWeek === 5) {
            expectedMinutes = 240; // Friday
        }

        let deficitMinutes = expectedMinutes - workingMinutes;
        
        // Clamp the deficit at zero if they worked overtime
        if (deficitMinutes < 0) {
            deficitMinutes = 0;
        }

        // ── Determine final status ────────────────────
        let status = attendance.status;

        // If today is a holiday or Sunday, any work is effectively extra, 
        // status doesn't have to be penalized as Half-day.
        if (!isSunday && !holiday) {
            if (dayOfWeek === 5) {
                if (workingHours >= 4) {
                    status = attendance.status === "Late" ? "Late" : "Present";
                } else {
                    status = "Half-day";
                }
            } else {
                if (workingHours < 6) {
                    status = "Half-day";
                }
            }
        }

        // ── Transaction: Update attendance & User debt 
        const [updatedAttendance] = await prisma.$transaction([
            prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    checkOut: now,
                    workingHours,
                    deficitMinutes,
                    status,
                },
            }),
            prisma.user.update({
                where: { id: user.id },
                data: {
                    totalTimeDebt: { increment: deficitMinutes }
                }
            })
        ]);

        return Response.json({
            success: true,
            message: `Checked out successfully. Working hours: ${workingHours}h. Status: ${status}.`,
            attendance: updatedAttendance,
        });
    } catch (error) {
        console.error("Check-out error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
