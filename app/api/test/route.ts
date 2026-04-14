import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return Response.json({
            success: true,
            message: "DB Connected!",
            users
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}