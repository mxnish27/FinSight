// Run this script to set admin27 (adminfinsight@gmail.com) as ADMIN
// Usage: npx ts-node scripts/set-admin.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setAdmin() {
  const adminEmail = "adminfinsight@gmail.com";
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!user) {
      console.log(`❌ User with email ${adminEmail} not found.`);
      console.log("Make sure the user is registered first.");
      return;
    }

    if (user.role === "ADMIN") {
      console.log(`✅ User ${user.name || adminEmail} is already an ADMIN.`);
      return;
    }

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully set ${user.name || adminEmail} as ADMIN!`);
    console.log("They can now access /dashboard/admin to view all users' spending.");
  } catch (error) {
    console.error("Error setting admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
