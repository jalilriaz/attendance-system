import { prisma } from "@/lib/prisma";
import { getUserFromToken, getTodayDateUTC } from "@/lib/auth";
import { processAutoAbsences } from "@/lib/attendance";

export async function GET() {
    try {
        const user = await getUserFromToken();
        if (!user) {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        // Trigger lazy-evaluation for 12 PM automatic absences
        await processAutoAbsences();

        const todayUTC = getTodayDateUTC();

        // Check for today's attendance record
        const [attendance, dbUser] = await Promise.all([
            prisma.attendance.findUnique({
                where: {
                    userId_date: {
                        userId: user.id,
                        date: todayUTC,
                    },
                },
            }),
            prisma.user.findUnique({
                where: { id: user.id },
                select: { totalTimeDebt: true }
            })
        ]);

        // Determine status
        let status: "not-checked-in" | "checked-in" | "checked-out" = "not-checked-in";
        if (attendance) {
            status = attendance.checkOut ? "checked-out" : "checked-in";
        }

        return Response.json({
            success: true,
            status,
            totalTimeDebt: dbUser?.totalTimeDebt ?? 0,
            attendance: attendance
                ? {
                      checkIn: attendance.checkIn,
                      checkOut: attendance.checkOut,
                      workingHours: attendance.workingHours,
                      attendanceStatus: attendance.status,
                  }
                : null,
        });
    } catch (error) {
        console.error("Today status error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
