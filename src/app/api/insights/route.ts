import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { generateFinancialInsights, type SpendingData } from "@/lib/openai";
import { getMonthYear } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { month, year } = await request.json();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: authUser.userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        insights: "No transactions found for this period. Add some transactions to get AI-powered insights!",
      });
    }

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};
    const merchantTotals: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === "CREDIT") {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }

      // Category breakdown (only expenses)
      if (t.type === "DEBIT") {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }

      // Merchant breakdown
      if (t.merchant && t.type === "DEBIT") {
        merchantTotals[t.merchant] = (merchantTotals[t.merchant] || 0) + t.amount;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const topMerchants = Object.entries(merchantTotals)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const spendingData: SpendingData = {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      categoryBreakdown,
      topMerchants,
      monthYear: getMonthYear(startDate),
    };

    const insights = await generateFinancialInsights(spendingData);

    return NextResponse.json({ insights, data: spendingData });
  } catch (error) {
    console.error("Generate insights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
