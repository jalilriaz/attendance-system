import { prisma } from "@/lib/prisma";
import { getUserFromToken, getTodayDateUTC } from "@/lib/auth";
import { processAutoAbsences } from "@/lib/attendance";

export async function GET() {
    try {
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        // Trigger lazy-evaluation for 12 PM automatic absences
        await processAutoAbsences();

        const todayUTC = getTodayDateUTC();

        const teachers = await prisma.user.findMany({
            where: { role: "teacher" },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                totalTimeDebt: true,
                attendances: {
                    where: { date: todayUTC },
                    select: {
                        id: true,
                        checkIn: true,
                        checkOut: true,
                        status: true,
                        workingHours: true,
                    },
                },
                leaves: {
                    where: { date: todayUTC, status: "Approved" },
                    select: { id: true },
                },
            },
            orderBy: { name: "asc" },
        });

        const result = teachers.map((t) => {
            const todayAttendance = t.attendances[0] || null;
            const isOnLeave = t.leaves.length > 0;

            let todayStatus = "Absent";
            if (isOnLeave) todayStatus = "On Leave";
            else if (todayAttendance) todayStatus = todayAttendance.status;

            return {
                id: t.id,
                name: t.name,
                email: t.email,
                createdAt: t.createdAt,
                totalTimeDebt: t.totalTimeDebt,
                todayStatus,
                todayAttendance: todayAttendance
                    ? {
                          id: todayAttendance.id,
                          checkIn: todayAttendance.checkIn,
                          checkOut: todayAttendance.checkOut,
                          workingHours: todayAttendance.workingHours,
                      }
                    : null,
            };
        });

        return Response.json({ success: true, teachers: result });
    } catch (error) {
        console.error("Teachers list error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
