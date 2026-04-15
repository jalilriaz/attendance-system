import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
    try {
        const admin = await getUserFromToken();
        if (!admin || admin.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        const { attendanceId, teacherId, checkIn, checkOut, status } = await request.json();

        if (status !== "Absent" && !checkIn) {
            return Response.json(
                { success: false, error: "Check In time is required unless marking Absent." },
                { status: 400 }
            );
        }

        if (!attendanceId && !teacherId) {
            return Response.json(
                { success: false, error: "Either Attendance ID or Teacher ID is required." },
                { status: 400 }
            );
        }

        let existingRecord = null;
        let targetUserId = teacherId;
        
        // If overriding an existing punch
        if (attendanceId) {
            existingRecord = await prisma.attendance.findUnique({
                where: { id: attendanceId },
                include: { user: true },
            });
            if (!existingRecord) {
                return Response.json({ success: false, error: "Attendance record not found." }, { status: 404 });
            }
            targetUserId = existingRecord.userId;
        }

        // Calculate expected minutes
        let dateObj = new Date();
        if (existingRecord) {
            dateObj = new Date(existingRecord.date);
        } else {
            // New record for today
            dateObj = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
        }
        
        const dayOfWeek = dateObj.getUTCDay(); // 0 is Sun, 5 is Fri
        const isSunday = dayOfWeek === 0;
        
        const holiday = await prisma.holiday.findFirst({
            where: { date: dateObj },
        });

        let expectedMinutes = 420; // 7 hours
        if (isSunday || holiday) {
            expectedMinutes = 0;
        } else if (dayOfWeek === 5) {
            expectedMinutes = 240; // Friday
        }

        let workingHours: number | null = null;
        let newDeficitMinutes: number | null = null;

        if (status === "Absent") {
            workingHours = 0;
            newDeficitMinutes = expectedMinutes;
        } else if (checkIn && checkOut) {
            const inTime = new Date(checkIn);
            const outTime = new Date(checkOut);
            const diffMs = outTime.getTime() - inTime.getTime();
            
            if (diffMs < 0) {
                return Response.json({ success: false, error: "Check Out time cannot be before Check In time." }, { status: 400 });
            }

            const workingMinutes = Math.floor(diffMs / (1000 * 60));
            workingHours = parseFloat((workingMinutes / 60).toFixed(2));
            
            newDeficitMinutes = expectedMinutes - workingMinutes;
            if (newDeficitMinutes < 0) newDeficitMinutes = 0; // Clamp
        }

        const finalDeficit = newDeficitMinutes ?? 0;

        let updatedAttendance;

        if (existingRecord) {
            // Update mode
            const oldDeficit = existingRecord.deficitMinutes ?? 0;
            const deficitDifference = finalDeficit - oldDeficit;

            [updatedAttendance] = await prisma.$transaction([
                prisma.attendance.update({
                    where: { id: attendanceId },
                    data: {
                        checkIn: checkIn ? new Date(checkIn) : null,
                        checkOut: checkOut ? new Date(checkOut) : null,
                        workingHours,
                        deficitMinutes: newDeficitMinutes,
                        status,
                    },
                }),
                prisma.user.update({
                    where: { id: targetUserId },
                    data: { totalTimeDebt: { increment: deficitDifference } },
                }),
            ]);
        } else {
            // Create mode
            const deficitDifference = finalDeficit;

            [updatedAttendance] = await prisma.$transaction([
                prisma.attendance.create({
                    data: {
                        userId: targetUserId,
                        date: dateObj,
                        checkIn: checkIn ? new Date(checkIn) : null,
                        checkOut: checkOut ? new Date(checkOut) : null,
                        workingHours,
                        deficitMinutes: newDeficitMinutes,
                        status,
                    },
                }),
                prisma.user.update({
                    where: { id: targetUserId },
                    data: { totalTimeDebt: { increment: deficitDifference } },
                }),
            ]);
        }

        return Response.json({
            success: true,
            message: "Attendance manual override successful.",
            attendance: updatedAttendance,
        });

    } catch (error) {
        console.error("Attendance override error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
