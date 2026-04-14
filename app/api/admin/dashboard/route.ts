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

        // Total teachers
        const totalTeachers = await prisma.user.count({
            where: { role: "teacher" },
        });

        // Present today
        const presentToday = await prisma.attendance.count({
            where: { date: todayUTC },
        });

        // Approved leaves today
        const onLeaveToday = await prisma.leave.count({
            where: {
                date: todayUTC,
                status: "Approved",
            },
        });

        // Pending leave requests
        const pendingRequests = await prisma.leave.count({
            where: { status: "Pending" },
        });

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

        return Response.json({
            success: true,
            stats: {
                totalTeachers,
                presentToday,
                onLeaveToday,
                pendingRequests,
            },
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
