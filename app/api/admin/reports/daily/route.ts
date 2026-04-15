import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/admin/reports/daily
 *
 * Returns day-by-day attendance records for CSV export.
 * Query params:
 *   - mode: "monthly" (default) or "yearly"
 *   - month: 1-12 (required for monthly)
 *   - year: e.g. 2026
 *   - teacherId: optional filter
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode") || "monthly";
        const yearStr = searchParams.get("year");
        const monthStr = searchParams.get("month");
        const teacherId = searchParams.get("teacherId") || undefined;

        if (!yearStr) {
            return Response.json(
                { success: false, error: "year is required." },
                { status: 400 }
            );
        }

        const year = parseInt(yearStr, 10);

        // Determine date range
        let startDate: Date;
        let endDate: Date;

        if (mode === "yearly") {
            startDate = new Date(Date.UTC(year, 0, 1)); // Jan 1
            endDate = new Date(Date.UTC(year, 11, 31)); // Dec 31
        } else {
            if (!monthStr) {
                return Response.json(
                    { success: false, error: "month is required for monthly mode." },
                    { status: 400 }
                );
            }
            const month = parseInt(monthStr, 10);
            startDate = new Date(Date.UTC(year, month - 1, 1));
            endDate = new Date(Date.UTC(year, month, 0)); // last day
        }

        // Fetch teachers
        const teacherFilter = teacherId
            ? { id: teacherId }
            : { role: "teacher" as const };

        const teachers = await prisma.user.findMany({
            where: teacherFilter,
            select: { id: true, name: true, email: true },
        });

        // Fetch all attendance records in range
        const attendances = await prisma.attendance.findMany({
            where: {
                userId: { in: teachers.map((t) => t.id) },
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: "asc" },
        });

        // Fetch holidays in range
        const holidays = await prisma.holiday.findMany({
            where: {
                date: { gte: startDate, lte: endDate },
            },
        });
        const holidayMap = new Map(
            holidays.map((h) => [h.date.toISOString().split("T")[0], h.title])
        );

        // Fetch approved leaves in range
        const leaves = await prisma.leave.findMany({
            where: {
                userId: { in: teachers.map((t) => t.id) },
                date: { gte: startDate, lte: endDate },
                status: "Approved",
            },
        });

        // Build lookup maps
        const attendanceMap = new Map<string, typeof attendances[number]>();
        for (const a of attendances) {
            const key = `${a.userId}_${a.date.toISOString().split("T")[0]}`;
            attendanceMap.set(key, a);
        }

        const leaveMap = new Map<string, typeof leaves[number]>();
        for (const l of leaves) {
            const key = `${l.userId}_${l.date.toISOString().split("T")[0]}`;
            leaveMap.set(key, l);
        }

        // Generate all dates in range
        const allDates: string[] = [];
        const cursor = new Date(startDate);
        while (cursor <= endDate) {
            allDates.push(cursor.toISOString().split("T")[0]);
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }

        // Build daily records per teacher
        const dailyRecords: {
            teacherName: string;
            teacherEmail: string;
            date: string;
            day: string;
            checkIn: string | null;
            checkOut: string | null;
            workingHours: number | null;
            status: string;
        }[] = [];

        for (const teacher of teachers) {
            for (const dateStr of allDates) {
                const d = new Date(dateStr + "T00:00:00Z");
                const dow = d.getUTCDay();
                const dayName = d.toLocaleDateString("en-US", {
                    weekday: "long",
                    timeZone: "UTC",
                });

                const key = `${teacher.id}_${dateStr}`;
                const attendance = attendanceMap.get(key);
                const leave = leaveMap.get(key);
                const holiday = holidayMap.get(dateStr);

                let status: string;
                let checkIn: string | null = null;
                let checkOut: string | null = null;
                let workingHours: number | null = null;

                if (dow === 0) {
                    status = "Sunday (Off)";
                } else if (holiday) {
                    status = `Holiday (${holiday})`;
                } else if (leave) {
                    status = `Leave (${leave.type})`;
                } else if (attendance) {
                    status = attendance.status;
                    checkIn = attendance.checkIn
                        ? new Date(attendance.checkIn).toLocaleTimeString("en-US", {
                              timeZone: "Asia/Karachi",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                          })
                        : null;
                    checkOut = attendance.checkOut
                        ? new Date(attendance.checkOut).toLocaleTimeString("en-US", {
                              timeZone: "Asia/Karachi",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                          })
                        : null;
                    workingHours = attendance.workingHours;
                } else {
                    // Future date or absent
                    const today = new Date();
                    const todayUTC = new Date(
                        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
                    );
                    if (d > todayUTC) {
                        status = "—";
                    } else {
                        status = "Absent";
                    }
                }

                dailyRecords.push({
                    teacherName: teacher.name,
                    teacherEmail: teacher.email,
                    date: dateStr,
                    day: dayName,
                    checkIn,
                    checkOut,
                    workingHours,
                    status,
                });
            }
        }

        return Response.json({
            success: true,
            mode,
            year,
            month: monthStr ? parseInt(monthStr) : undefined,
            totalDays: allDates.length,
            teachers: teachers.map((t) => ({ name: t.name, email: t.email })),
            records: dailyRecords,
        });
    } catch (error) {
        console.error("Daily reports error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
