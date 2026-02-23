import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let startDate: Date;
    let endDate: Date;

    if (month && year) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: authUser.userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === "CREDIT") {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Get monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const trendStart = new Date(startDate.getFullYear(), startDate.getMonth() - i, 1);
      const trendEnd = new Date(startDate.getFullYear(), startDate.getMonth() - i + 1, 0, 23, 59, 59);

      const monthTransactions = await prisma.transaction.findMany({
        where: {
          userId: authUser.userId,
          date: { gte: trendStart, lte: trendEnd },
        },
      });

      let monthIncome = 0;
      let monthExpense = 0;
      monthTransactions.forEach((t) => {
        if (t.type === "CREDIT") monthIncome += t.amount;
        else monthExpense += t.amount;
      });

      monthlyTrend.push({
        month: trendStart.toLocaleDateString("en-US", { month: "short" }),
        income: monthIncome,
        expense: monthExpense,
      });
    }

    // Get account balances
    const accounts = await prisma.account.findMany({
      where: { userId: authUser.userId },
    });

    const accountBalances = accounts.map((a) => ({
      name: a.name,
      balance: a.balance,
      type: a.type,
    }));

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      categoryBreakdown,
      monthlyTrend,
      accountBalances,
      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
