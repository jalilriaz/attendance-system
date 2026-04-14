import { prisma } from "./prisma";
import { getTodayDateUTC } from "./auth";

/**
 * Lazy evaluation function to enforce the 12:00 PM check-in deadline.
 * If called after 12:00 PM PST on a strictly working day, it will find all 
 * teachers who haven't checked in and mark them as "Absent".
 */
export async function processAutoAbsences() {
    try {
        const now = new Date();
        
        // ── 1. Check time: Must be >= 12:00 PM PST ────────────────
        // Vercel server might be in UTC, so we get the PST hours.
        const karachiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
        
        if (karachiTime.getHours() < 12) {
            return; // Too early, do nothing
        }

        // ── 2. Check if today is Sunday ───────────────────────────
        if (karachiTime.getDay() === 0) {
            return; // Sunday off, do nothing
        }

        const todayUTC = getTodayDateUTC();

        // ── 3. Check if today is a Holiday ────────────────────────
        const isHoliday = await prisma.holiday.findUnique({
            where: { date: todayUTC }
        });

        if (isHoliday) {
            return; // Holiday off, do nothing
        }

        // ── 4. Find teachers without attendance or leave today ────
        // Teachers who do NOT have an attendance record for today AND
        // do NOT have an approved leave for today.
        const missingTeachers = await prisma.user.findMany({
            where: {
                role: "teacher",
                // They don't have an attendance record today
                attendances: {
                    none: { date: todayUTC }
                },
                // They don't have an approved leave today
                leaves: {
                    none: { 
                        date: todayUTC,
                        status: "Approved"
                    }
                }
            },
            select: { id: true }
        });

        if (missingTeachers.length === 0) {
            return; // Everyone is accounted for
        }

        // ── 5. Bulk create "Absent" records ───────────────────────
        // We set checkIn and checkOut to null. The schema requires checkIn to be DateTime,
        // but looking at `prisma/schema.prisma` the checkIn might not be optional.
        // Let's verify the schema for `Attendance`.
        
        // Actually, checkIn is DateTime. If absent, we might just store current timestamp, 
        // or the schema might require changes, but usually we just set checkIn = date
        // Let's use the current time for `checkIn` but `status` = "Absent", workingHours = 0.
        // The check-in override UI will let admin fix it.

        await prisma.attendance.createMany({
            data: missingTeachers.map(t => ({
                userId: t.id,
                date: todayUTC,
                checkIn: now, // required by schema, but status dictates it means nothing
                status: "Absent",
                workingHours: 0
            })),
            skipDuplicates: true // Just in case concurrency causes race conditions
        });

        console.log(`Auto-marked ${missingTeachers.length} teachers as Absent at 12 PM.`);

    } catch (error) {
        console.error("Auto absence processing failed:", error);
    }
}
