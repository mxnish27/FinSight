import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

interface BudgetData {
  category: string;
  amount: number;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
}

interface Transaction {
  category: string;
  amount: number;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    // Get all budgets for user (monthly budgets apply to all months)
    const budgets: Budget[] = await prisma.budget.findMany({
      where: {
        userId: payload.userId,
      },
    });

    // Get actual spending for each category this month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions: Transaction[] = await prisma.transaction.findMany({
      where: {
        account: { userId: payload.userId },
        type: "DEBIT",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    transactions.forEach((t: Transaction) => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });

    // Combine budgets with actual spending
    const budgetData = budgets.map((b: Budget) => ({
      id: b.id,
      category: b.category,
      budgetAmount: b.amount,
      spent: spendingByCategory[b.category] || 0,
      remaining: b.amount - (spendingByCategory[b.category] || 0),
      percentUsed: b.amount > 0 ? ((spendingByCategory[b.category] || 0) / b.amount) * 100 : 0,
    }));

    // Get categories without budgets but with spending
    const categoriesWithSpending = Object.keys(spendingByCategory).filter(
      (cat) => !budgets.some((b: Budget) => b.category === cat)
    );

    const unbudgetedSpending = categoriesWithSpending.map((category) => ({
      id: null,
      category,
      budgetAmount: 0,
      spent: spendingByCategory[category],
      remaining: -spendingByCategory[category],
      percentUsed: 100,
      isUnbudgeted: true,
    }));

    // Total stats
    const totalBudget = budgets.reduce((sum: number, b: Budget) => sum + b.amount, 0);
    const totalSpent = Object.values(spendingByCategory).reduce((sum: number, v: number) => sum + v, 0);

    return NextResponse.json({
      budgets: [...budgetData, ...unbudgetedSpending],
      summary: {
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        percentUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      },
      month,
      year,
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body: BudgetData = await request.json();
    const { category, amount } = body;

    if (!category || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert budget (update if exists, create if not)
    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId: payload.userId,
          category,
        },
      },
      update: { amount },
      create: {
        userId: payload.userId,
        category,
        amount,
      },
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Budget ID required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const budget = await prisma.budget.findFirst({
      where: { id, userId: payload.userId },
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
