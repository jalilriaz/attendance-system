import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken();
        if (!user) {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get("month");

        let startDate: Date;
        let endDate: Date;

        if (monthParam === "current" || !monthParam) {
            // Current month
            const now = new Date();
            startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
            endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
        } else {
            // Expect format: YYYY-MM
            const [year, month] = monthParam.split("-").map(Number);
            startDate = new Date(Date.UTC(year, month - 1, 1));
            endDate = new Date(Date.UTC(year, month, 0));
        }

        const records = await prisma.attendance.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: "desc" },
        });

        // Also fetch leaves for the month
        const leaves = await prisma.leave.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: "Approved",
            },
        });

        return Response.json({
            success: true,
            records,
            leaves,
        });
    } catch (error) {
        console.error("Attendance history error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
