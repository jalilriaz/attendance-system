import { prisma } from "./prisma";
import bcrypt from "bcrypt";

async function seed() {
    try {
        // ── Admin User ──────────────────────────────────────
        const adminPassword = await bcrypt.hash("Admin@madrassa123", 10);

        const admin = await prisma.user.upsert({
            where: { email: "admin@madrasakaramkhan.edu" },
            update: { password: adminPassword },
            create: {
                name: "Admin",
                email: "admin@madrasakaramkhan.edu",
                role: "admin",
                password: adminPassword,
            },
        });

        console.log("✅ Admin user created/updated:");
        console.log(`   Name:     ${admin.name}`);
        console.log(`   Email:    admin@madrasakaramkhan.edu`);
        console.log(`   Password: Admin@madrassa123`);
        console.log(`   Role:     ${admin.role}`);
        console.log();

        // ── Teacher User ────────────────────────────────────
        const teacherPassword = await bcrypt.hash("Teacher@hifz", 10);

        const teacher = await prisma.user.upsert({
            where: { email: "teacher@madrasakaramkhan.edu" },
            update: { password: teacherPassword, name: "Qari Shabbir Sab" },
            create: {
                name: "Qari Shabbir Sab",
                email: "teacher@madrasakaramkhan.edu",
                role: "teacher",
                password: teacherPassword,
            },
        });

        console.log("✅ Teacher user created/updated:");
        console.log(`   Name:     ${teacher.name}`);
        console.log(`   Email:    teacher@madrasakaramkhan.edu`);
        console.log(`   Password: Teacher@hifz`);
        console.log(`   Role:     ${teacher.role}`);
    } catch (error) {
        console.error("❌ Seed error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
