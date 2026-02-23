import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause = userId ? { userId } : {};

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true },
        },
        account: {
          select: { name: true, type: true },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    const stats = await prisma.transaction.groupBy({
      by: ["type"],
      where: whereClause,
      _sum: { amount: true },
    });

    const totalIncome = stats.find((s) => s.type === "CREDIT")?._sum.amount || 0;
    const totalExpense = stats.find((s) => s.type === "DEBIT")?._sum.amount || 0;

    return NextResponse.json({
      transactions,
      stats: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        count: transactions.length,
      },
    });
  } catch (error) {
    console.error("Admin get transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
