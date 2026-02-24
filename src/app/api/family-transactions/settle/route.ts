import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { calculateFamilyBalances, optimizeSettlements } from "@/lib/financial-engine";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all unsettled transactions
    const transactions = await prisma.familyTransaction.findMany({
      where: { userId: user.userId, isSettled: false },
    });

    // Calculate balances and optimal settlements
    const balances = calculateFamilyBalances(
      transactions.map((t) => ({
        fromPerson: t.fromPerson,
        toPerson: t.toPerson,
        amount: t.amount,
        isSettled: t.isSettled,
      }))
    );

    const settlements = optimizeSettlements(balances);

    // Calculate monthly summary
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= thisMonthStart
    );

    const monthlyTotal = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = thisMonthTransactions.length;

    return NextResponse.json({
      balances,
      settlements,
      monthlySummary: {
        total: monthlyTotal,
        count: transactionCount,
        month: now.toLocaleString("default", { month: "long", year: "numeric" }),
      },
    });
  } catch (error: any) {
    console.error("Settlement calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate settlements", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all transactions as settled
    const result = await prisma.familyTransaction.updateMany({
      where: { userId: user.userId, isSettled: false },
      data: { isSettled: true },
    });

    return NextResponse.json({
      success: true,
      settledCount: result.count,
      message: `${result.count} transactions marked as settled`,
    });
  } catch (error: any) {
    console.error("Settle all error:", error);
    return NextResponse.json(
      { error: "Failed to settle transactions", details: error?.message },
      { status: 500 }
    );
  }
}
