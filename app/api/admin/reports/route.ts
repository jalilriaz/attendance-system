import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

// ── Schedule constants ────────────────────────────
// Mon-Thu & Sat: 8 AM – 3 PM = 7 hours
// Friday: 8 AM – 12 PM = 4 hours
// Sunday: Off
const HOURS_MON_THU_SAT = 7;
const HOURS_FRIDAY = 4;

/**
 * Returns expected working hours for a given day (0=Sun..6=Sat).
 */
function getExpectedHours(dayOfWeek: number): number {
    if (dayOfWeek === 0) return 0; // Sunday
    if (dayOfWeek === 5) return HOURS_FRIDAY; // Friday
    return HOURS_MON_THU_SAT; // Mon-Thu, Sat
}

/**
 * Counts the number of Sundays in a given month.
 */
function countSundaysInMonth(year: number, month: number): number {
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCDay() === 0) count++;
    }
    return count;
}

/**
 * Gets all Sunday dates in a month as ISO strings.
 */
function getSundayDatesInMonth(year: number, month: number): string[] {
    const sundays: string[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCDay() === 0) {
            sundays.push(date.toISOString().split("T")[0]);
        }
    }
    return sundays;
}

/**
 * Generates all working dates in a month,
 * excluding Sundays and holidays.
 */
function getWorkingDaysInMonth(
    year: number,
    month: number, // 1-based (1=Jan)
    holidayDates: Set<string>
) {
    const workingDays: Date[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month - 1, day));
        const dow = date.getUTCDay();
        const dateStr = date.toISOString().split("T")[0];

        // Skip Sundays and holidays
        if (dow === 0) continue;
        if (holidayDates.has(dateStr)) continue;

        workingDays.push(date);
    }

    return workingDays;
}

/**
 * Groups dates by ISO week number.
 */
function getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Builds a single month's report data.
 */
async function buildMonthReport(year: number, month: number, teacherId?: string) {
    // ── Date range for the month ──────────────────
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // last day of month
    const totalCalendarDays = new Date(year, month, 0).getDate();

    // ── Count Sundays ─────────────────────────────
    const totalSundays = countSundaysInMonth(year, month);
    const sundayDates = getSundayDatesInMonth(year, month);

    // ── Fetch holidays in this month ──────────────
    const holidays = await prisma.holiday.findMany({
        where: {
            date: { gte: startDate, lte: endDate },
        },
    });

    const holidayDates = new Set(
        holidays.map((h) => h.date.toISOString().split("T")[0])
    );

    // ── Calculate working days ────────────────────
    const workingDays = getWorkingDaysInMonth(year, month, holidayDates);

    const expectedWorkingDays = workingDays.length;
    const expectedMonthlyHours = workingDays.reduce(
        (sum, d) => sum + getExpectedHours(d.getUTCDay()),
        0
    );

    // ── Build teacher filter ──────────────────────
    const teacherFilter = teacherId
        ? { id: teacherId }
        : { role: "teacher" };

    const teachers = await prisma.user.findMany({
        where: teacherFilter,
        select: { id: true, name: true, email: true, totalTimeDebt: true },
    });

    // ── Build report for each teacher ─────────────
    const reports = await Promise.all(
        teachers.map(async (teacher) => {
            // Attendance records for this month
            const attendances = await prisma.attendance.findMany({
                where: {
                    userId: teacher.id,
                    date: { gte: startDate, lte: endDate },
                },
                orderBy: { date: "asc" },
            });

            // Approved leaves for this month
            const approvedLeaves = await prisma.leave.findMany({
                where: {
                    userId: teacher.id,
                    date: { gte: startDate, lte: endDate },
                    status: "Approved",
                },
            });

            const paidLeavesCount = approvedLeaves.filter(l => l.type === "Paid").length;
            const unpaidLeavesCount = approvedLeaves.filter(l => l.type === "Unpaid").length;

            // Build lookup maps
            const attendanceByDate = new Map(
                attendances.map((a) => [a.date.toISOString().split("T")[0], a])
            );

            const approvedLeavesByDate = new Map(
                approvedLeaves.map((l) => [l.date.toISOString().split("T")[0], l])
            );

            // ── Monthly totals ────────────────────
            let totalWorkingHours = 0;
            let presentDays = 0;
            let lateDays = 0;
            let halfDays = 0;
            let absentDays = 0;

            for (const day of workingDays) {
                const dateStr = day.toISOString().split("T")[0];
                const record = attendanceByDate.get(dateStr);
                const leaveRecord = approvedLeavesByDate.get(dateStr);

                if (leaveRecord) {
                    // Only PAID leaves are excused.
                    // UNPAID leaves count as absent days.
                    if (leaveRecord.type === "Paid") {
                        continue; // Excused — skip this day
                    } else {
                        // Unpaid leave = absent day
                        const today = new Date();
                        const todayUTC = new Date(
                            Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
                        );
                        if (day <= todayUTC) {
                            absentDays++;
                        }
                        continue;
                    }
                }

                if (!record) {
                    // No attendance and no leave = absent
                    // Only count as absent if the date is in the past
                    const today = new Date();
                    const todayUTC = new Date(
                        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
                    );
                    if (day <= todayUTC) {
                        absentDays++;
                    }
                } else {
                    totalWorkingHours += record.workingHours ?? 0;

                    if (record.status === "Present") presentDays++;
                    else if (record.status === "Late") lateDays++;
                    else if (record.status === "Half-day") halfDays++;
                    else if (record.status === "Absent") absentDays++;
                }
            }

            // ── Weekly breakdown ──────────────────
            const weeklyMap = new Map<
                number,
                {
                    week: number;
                    expectedHours: number;
                    actualHours: number;
                    expectedDays: number;
                    presentDays: number;
                    absentDays: number;
                }
            >();

            for (const day of workingDays) {
                const weekNum = getISOWeek(day);
                const dateStr = day.toISOString().split("T")[0];
                const record = attendanceByDate.get(dateStr);
                const leaveRecord = approvedLeavesByDate.get(dateStr);
                const expHrs = getExpectedHours(day.getUTCDay());

                if (!weeklyMap.has(weekNum)) {
                    weeklyMap.set(weekNum, {
                        week: weekNum,
                        expectedHours: 0,
                        actualHours: 0,
                        expectedDays: 0,
                        presentDays: 0,
                        absentDays: 0,
                    });
                }

                const w = weeklyMap.get(weekNum)!;
                w.expectedHours += expHrs;
                w.expectedDays += 1;

                if (leaveRecord && leaveRecord.type === "Paid") {
                    // Paid leave day — excused, not present or absent
                } else if (leaveRecord && leaveRecord.type === "Unpaid") {
                    // Unpaid leave day — counts as absent
                    const today = new Date();
                    const todayUTC = new Date(
                        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
                    );
                    if (day <= todayUTC) {
                        w.absentDays += 1;
                    }
                } else if (record) {
                    w.actualHours += record.workingHours ?? 0;
                    if (record.status === "Present" || record.status === "Late") {
                        w.presentDays += 1;
                    }
                } else {
                    const today = new Date();
                    const todayUTC = new Date(
                        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
                    );
                    if (day <= todayUTC) {
                        w.absentDays += 1;
                    }
                }
            }

            const weeklyBreakdown = Array.from(weeklyMap.values()).sort(
                (a, b) => a.week - b.week
            );

            return {
                teacher: {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email,
                },
                monthly: {
                    expectedWorkingDays,
                    expectedMonthlyHours,
                    totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
                    hourDeficit: parseFloat(
                        (expectedMonthlyHours - totalWorkingHours).toFixed(2)
                    ),
                    presentDays,
                    lateDays,
                    halfDays,
                    absentDays,
                    approvedLeaves: approvedLeaves.length,
                    paidLeaves: paidLeavesCount,
                    unpaidLeaves: unpaidLeavesCount,
                    totalTimeDebt: teacher.totalTimeDebt,
                    totalHolidays: holidays.length,
                },
                weeklyBreakdown,
            };
        })
    );

    return {
        period: {
            month,
            year,
            totalCalendarDays,
            totalSundays,
            sundayDates,
            expectedWorkingDays,
            expectedMonthlyHours,
            totalHolidays: holidays.length,
            holidays: holidays.map((h) => ({
                title: h.title,
                date: h.date.toISOString().split("T")[0],
            })),
            vacationSummary: {
                sundays: totalSundays,
                holidays: holidays.length,
                totalNonWorkingDays: totalSundays + holidays.length,
                netWorkingDays: expectedWorkingDays,
            },
        },
        reports,
    };
}

export async function GET(request: NextRequest) {
    try {
        // ── Auth: Admin only ──────────────────────────
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }

        // ── Parse query params ────────────────────────
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode"); // "monthly" (default) or "yearly"
        const yearStr = searchParams.get("year");
        const monthStr = searchParams.get("month");
        const teacherId = searchParams.get("teacherId") || undefined;

        // ── YEARLY MODE ───────────────────────────────
        if (mode === "yearly") {
            if (!yearStr) {
                return Response.json(
                    { success: false, error: "year query parameter is required for yearly mode." },
                    { status: 400 }
                );
            }

            const year = parseInt(yearStr, 10);
            if (isNaN(year)) {
                return Response.json(
                    { success: false, error: "Invalid year." },
                    { status: 400 }
                );
            }

            // Aggregate all 12 months
            const monthlyData = [];
            let yearTotals = {
                totalCalendarDays: 0,
                totalSundays: 0,
                totalHolidays: 0,
                totalWorkingDays: 0,
                totalExpectedHours: 0,
            };

            for (let m = 1; m <= 12; m++) {
                const result = await buildMonthReport(year, m, teacherId);
                const p = result.period;

                monthlyData.push({
                    month: m,
                    monthName: new Date(year, m - 1).toLocaleString("en-US", { month: "long" }),
                    calendarDays: p.totalCalendarDays,
                    sundays: p.totalSundays,
                    holidays: p.totalHolidays,
                    holidayList: p.holidays,
                    workingDays: p.expectedWorkingDays,
                    expectedHours: p.expectedMonthlyHours,
                });

                yearTotals.totalCalendarDays += p.totalCalendarDays;
                yearTotals.totalSundays += p.totalSundays;
                yearTotals.totalHolidays += p.totalHolidays;
                yearTotals.totalWorkingDays += p.expectedWorkingDays;
                yearTotals.totalExpectedHours += p.expectedMonthlyHours;
            }

            return Response.json({
                success: true,
                mode: "yearly",
                year,
                months: monthlyData,
                totals: yearTotals,
            });
        }

        // ── MONTHLY MODE (default) ────────────────────
        if (!monthStr || !yearStr) {
            return Response.json(
                { success: false, error: "month and year query parameters are required." },
                { status: 400 }
            );
        }

        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);

        if (month < 1 || month > 12 || isNaN(year)) {
            return Response.json(
                { success: false, error: "Invalid month (1-12) or year." },
                { status: 400 }
            );
        }

        const result = await buildMonthReport(year, month, teacherId);

        return Response.json({
            success: true,
            mode: "monthly",
            ...result,
        });
    } catch (error) {
        console.error("Reports error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
