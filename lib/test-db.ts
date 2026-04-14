import { prisma } from "./prisma";

async function main() {
    try {
        // Try creating a test user
        const user = await prisma.user.create({
            data: {
                name: "Test User",
                email: "test@example.com",
                password: "dummy",
                role: "ADMIN",
            },
        });
        console.log("✅ Database working! Created user:", user);
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();