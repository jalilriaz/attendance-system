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

        // Trigger lazy-evaluation for 12 PM automatic absences asynchronously so we don't block render pipeline
        processAutoAbsences().catch(console.error);

        const todayUTC = getTodayDateUTC();

        // Fetch the primary teacher (Qari Sahib)
        const primaryTeacher = await prisma.user.findFirst({
            where: { role: "teacher" },
            select: { id: true, name: true, totalTimeDebt: true }
        });

        let teacherStatus = null;

        if (primaryTeacher) {
            // Check their attendance today
            const attendance = await prisma.attendance.findUnique({
                where: {
                    userId_date: {
                        userId: primaryTeacher.id,
                        date: todayUTC
                    }
                }
            });

            // Check if they are on leave today
            const leave = await prisma.leave.findUnique({
                where: {
                    userId_date: {
                        userId: primaryTeacher.id,
                        date: todayUTC
                    }
                }
            });

            teacherStatus = {
                name: primaryTeacher.name,
                totalTimeDebt: primaryTeacher.totalTimeDebt,
                attendance: attendance ? {
                    checkIn: attendance.checkIn,
                    checkOut: attendance.checkOut,
                    status: attendance.status
                } : null,
                leave: leave && leave.status === "Approved" ? leave.type : null
            };
        }

        // Recent activity (last 10 events)
        const recentAttendance = await prisma.attendance.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true } } },
        });

        const recentLeaves = await prisma.leave.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true } } },
        });

        const activity = [
            ...recentAttendance.map((a) => ({
                id: a.id,
                type: "attendance" as const,
                message: `${a.user.name} ${a.checkOut ? "checked out" : "checked in"} — ${a.status}`,
                timestamp: a.createdAt.toISOString(),
            })),
            ...recentLeaves.map((l) => ({
                id: l.id,
                type: "leave" as const,
                message: `${l.user.name} — Leave ${l.status.toLowerCase()} for ${new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
                timestamp: l.createdAt.toISOString(),
            })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            )
            .slice(0, 8);

        const pendingRequests = await prisma.leave.count({
            where: { status: "Pending" },
        });

        return Response.json({
            success: true,
            teacherStatus,
            pendingRequests,
            activity,
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
