import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// Categories that should NOT be counted as expenses (liability settlements)
const EXCLUDED_EXPENSE_CATEGORIES = ["Bill Payment"];

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
      include: { account: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((t) => {
      // Skip bill payments - they are liability settlements, not expenses
      const isExcluded = EXCLUDED_EXPENSE_CATEGORIES.includes(t.category);
      
      if (t.type === "CREDIT") {
        // For BANK accounts, CREDIT = income
        // For CREDIT_CARD, CREDIT = bill payment received (not income)
        if (t.account.type === "BANK" && !isExcluded) {
          totalIncome += t.amount;
        }
      } else {
        // DEBIT transactions
        // For BANK accounts: DEBIT = expense (unless it's bill payment)
        // For CREDIT_CARD: DEBIT = spending (this IS an expense)
        if (!isExcluded) {
          totalExpense += t.amount;
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }
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
        include: { account: true },
      });

      let monthIncome = 0;
      let monthExpense = 0;
      monthTransactions.forEach((t) => {
        const isExcluded = EXCLUDED_EXPENSE_CATEGORIES.includes(t.category);
        if (t.type === "CREDIT" && t.account.type === "BANK" && !isExcluded) {
          monthIncome += t.amount;
        } else if (t.type === "DEBIT" && !isExcluded) {
          monthExpense += t.amount;
        }
      });

      monthlyTrend.push({
        month: trendStart.toLocaleDateString("en-US", { month: "short" }),
        income: monthIncome,
        expense: monthExpense,
      });
    }

    // Get account balances with proper credit card handling
    const accounts = await prisma.account.findMany({
      where: { userId: authUser.userId },
    });

    const accountBalances = accounts.map((a) => ({
      name: a.name,
      balance: a.type === "CREDIT_CARD" ? -a.currentOutstanding : a.balance, // Show outstanding as negative
      type: a.type,
      creditLimit: a.creditLimit,
      currentOutstanding: a.currentOutstanding,
    }));

    // Calculate total liabilities (credit card outstanding)
    const totalLiabilities = accounts
      .filter((a) => a.type === "CREDIT_CARD")
      .reduce((sum, a) => sum + a.currentOutstanding, 0);

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      categoryBreakdown,
      monthlyTrend,
      accountBalances,
      transactionCount: transactions.length,
      totalLiabilities,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
