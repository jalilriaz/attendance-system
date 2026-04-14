import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const admin = await getUserFromToken();
        if (!admin || admin.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        const { teacherId } = await request.json();

        if (!teacherId) {
            return Response.json(
                { success: false, error: "Teacher ID is required." },
                { status: 400 }
            );
        }

        const teacher = await prisma.user.update({
            where: { id: teacherId, role: "teacher" },
            data: { totalTimeDebt: 0 },
        });

        return Response.json({
            success: true,
            message: `Time debt for ${teacher.name} has been reset to 0.`,
            teacher,
        });
    } catch (error) {
        console.error("Reset debt error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
