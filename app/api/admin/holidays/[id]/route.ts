import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const holiday = await prisma.holiday.findUnique({
            where: { id },
        });

        if (!holiday) {
            return Response.json(
                { success: false, error: "Holiday not found." },
                { status: 404 }
            );
        }

        await prisma.holiday.delete({ where: { id } });

        return Response.json({
            success: true,
            message: "Holiday deleted successfully.",
        });
    } catch (error) {
        console.error("Holiday delete error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
