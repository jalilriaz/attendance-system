import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
    try {
        // ── Auth: Admin only ──────────────────────────
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }

        const { leaveId, status } = await request.json();

        // ── Validate input ────────────────────────────
        if (!leaveId || !status) {
            return Response.json(
                { success: false, error: "leaveId and status are required." },
                { status: 400 }
            );
        }

        if (!["Approved", "Rejected"].includes(status)) {
            return Response.json(
                { success: false, error: "Status must be 'Approved' or 'Rejected'." },
                { status: 400 }
            );
        }

        // ── Find existing leave ───────────────────────
        const existingLeave = await prisma.leave.findUnique({
            where: { id: leaveId },
        });

        if (!existingLeave) {
            return Response.json(
                { success: false, error: "Leave request not found." },
                { status: 404 }
            );
        }

        if (existingLeave.status !== "Pending") {
            return Response.json(
                { success: false, error: `Leave already ${existingLeave.status.toLowerCase()}.` },
                { status: 400 }
            );
        }

        // ── Update leave status ───────────────────────
        const updatedLeave = await prisma.leave.update({
            where: { id: leaveId },
            data: { status },
            include: { user: { select: { name: true, email: true } } },
        });

        return Response.json({
            success: true,
            message: `Leave ${status.toLowerCase()} successfully.`,
            leave: updatedLeave,
        });
    } catch (error) {
        console.error("Leave update error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}

// ── GET: List all pending leaves for admin review ──
export async function GET() {
    try {
        const user = await getUserFromToken();
        if (!user || user.role !== "admin") {
            return Response.json(
                { success: false, error: "Unauthorized. Admin access required." },
                { status: 401 }
            );
        }

        const leaves = await prisma.leave.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } },
        });

        return Response.json({ success: true, leaves });
    } catch (error) {
        console.error("Leave list error:", error);
        return Response.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
