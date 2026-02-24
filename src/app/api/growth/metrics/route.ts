import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  calculateFinSightScore,
  generateDiagnosis,
  detectLifestyleLeaks,
  getWealthBuildingSuggestions,
  analyzeRiskExposure,
  type FinancialMetrics,
  type CategorySpending,
} from "@/lib/financial-engine";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
    const lastMonth = new Date(currentYear, currentMonth - 1, 1);
    const thisMonthStart = new Date(currentYear, currentMonth, 1);

    // Fetch all required data
    const [
      transactions,
      accounts,
      budgets,
      incomeSources,
      debts,
      savingsGoals,
      netWorthSnapshots,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.userId, date: { gte: threeMonthsAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.account.findMany({
        where: { userId: user.userId },
      }),
      prisma.budget.findMany({
        where: { userId: user.userId },
      }),
      prisma.incomeSource.findMany({
        where: { userId: user.userId, isActive: true },
      }),
      prisma.debt.findMany({
        where: { userId: user.userId },
      }),
      prisma.savingsGoal.findMany({
        where: { userId: user.userId, status: "ACTIVE" },
      }),
      prisma.netWorthSnapshot.findMany({
        where: { userId: user.userId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 6,
      }),
    ]);

    // Calculate metrics
    const thisMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= thisMonthStart
    );
    const lastMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= lastMonth && new Date(t.date) < thisMonthStart
    );

    const thisMonthIncome = thisMonthTransactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);
    const thisMonthExpenses = thisMonthTransactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0);
    const lastMonthExpenses = lastMonthTransactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0);

    // Income from sources or transactions
    const monthlyIncome =
      incomeSources.reduce((sum, s) => {
        if (s.frequency === "MONTHLY") return sum + s.amount;
        if (s.frequency === "YEARLY") return sum + s.amount / 12;
        if (s.frequency === "WEEKLY") return sum + s.amount * 4;
        return sum + s.amount;
      }, 0) || thisMonthIncome || 50000; // Default fallback

    // Calculate totals
    const totalAssets = accounts
      .filter((a) => a.type === "DEBIT")
      .reduce((sum, a) => sum + a.balance, 0);
    const totalDebts = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const netWorth = totalAssets - totalDebts;

    // Net worth growth
    const latestSnapshot = netWorthSnapshots[0];
    const previousSnapshot = netWorthSnapshots[1];
    const netWorthGrowth =
      latestSnapshot && previousSnapshot
        ? ((latestSnapshot.netWorth - previousSnapshot.netWorth) /
            Math.abs(previousSnapshot.netWorth || 1)) *
          100
        : 0;

    // Savings rate
    const savingsRate =
      monthlyIncome > 0
        ? ((monthlyIncome - thisMonthExpenses) / monthlyIncome) * 100
        : 0;

    // Debt to income ratio
    const debtToIncomeRatio =
      monthlyIncome > 0 ? (totalDebts / (monthlyIncome * 12)) * 100 : 0;

    // Budget adherence
    const categoryTotals: Record<string, number> = {};
    thisMonthTransactions
      .filter((t) => t.type === "DEBIT")
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    let withinBudget = 0;
    let totalBudgetCategories = budgets.length || 1;
    budgets.forEach((b) => {
      if ((categoryTotals[b.category] || 0) <= b.amount) withinBudget++;
    });
    const budgetAdherence = (withinBudget / totalBudgetCategories) * 100;

    // Expense growth rate
    const expenseGrowthRate =
      lastMonthExpenses > 0
        ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0;

    // Discretionary ratio
    const discretionaryCategories = [
      "Entertainment",
      "Shopping",
      "Dining",
      "Food",
      "Travel",
      "Subscriptions",
    ];
    const discretionarySpending = thisMonthTransactions
      .filter(
        (t) =>
          t.type === "DEBIT" &&
          discretionaryCategories.some((c) =>
            t.category.toLowerCase().includes(c.toLowerCase())
          )
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const discretionaryRatio =
      thisMonthExpenses > 0 ? (discretionarySpending / thisMonthExpenses) * 100 : 0;

    // Recurring expenses (simplified)
    const recurringExpenses = thisMonthTransactions
      .filter(
        (t) =>
          t.type === "DEBIT" &&
          (t.category.toLowerCase().includes("subscription") ||
            t.category.toLowerCase().includes("rent") ||
            t.category.toLowerCase().includes("emi") ||
            t.category.toLowerCase().includes("insurance"))
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Emergency fund months
    const emergencyFund = accounts
      .filter(
        (a) =>
          a.type === "DEBIT" &&
          (a.name.toLowerCase().includes("saving") ||
            a.name.toLowerCase().includes("emergency"))
      )
      .reduce((sum, a) => sum + a.balance, 0);
    const monthlyExpensesAvg = thisMonthExpenses || 30000;
    const emergencyFundMonths =
      monthlyExpensesAvg > 0 ? emergencyFund / monthlyExpensesAvg : 0;

    const metrics: FinancialMetrics = {
      totalIncome: monthlyIncome,
      totalExpenses: thisMonthExpenses,
      savingsRate,
      debtToIncomeRatio,
      netWorth,
      netWorthGrowth,
      budgetAdherence,
      expenseGrowthRate,
      discretionaryRatio,
      recurringExpenses,
      emergencyFundMonths,
    };

    // Category spending breakdown
    const categorySpending: CategorySpending[] = Object.entries(categoryTotals).map(
      ([category, amount]) => {
        const budget = budgets.find((b) => b.category === category);
        const lastMonthCat = lastMonthTransactions
          .filter((t) => t.type === "DEBIT" && t.category === category)
          .reduce((sum, t) => sum + t.amount, 0);
        const trend =
          lastMonthCat > 0 ? ((amount - lastMonthCat) / lastMonthCat) * 100 : 0;

        return {
          category,
          amount,
          percentage: thisMonthExpenses > 0 ? (amount / thisMonthExpenses) * 100 : 0,
          trend,
          budget: budget?.amount,
          overBudget: budget ? amount > budget.amount : false,
        };
      }
    );

    // Calculate FinSight Score
    const finSightScore = calculateFinSightScore(metrics);

    // Generate diagnosis
    const diagnosis = generateDiagnosis(metrics, categorySpending);

    // Detect lifestyle leaks
    const lifestyleLeaks = detectLifestyleLeaks(
      thisMonthTransactions.map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.date,
        merchant: t.merchant || undefined,
      }))
    );

    // Wealth building suggestions
    const wealthSuggestions = getWealthBuildingSuggestions(metrics);

    // Risk exposure
    const riskExposure = analyzeRiskExposure(
      incomeSources.map((s) => ({ amount: s.amount })),
      totalAssets,
      accounts
        .filter(
          (a) =>
            a.type === "DEBIT" &&
            (a.name.toLowerCase().includes("saving") ||
              a.name.toLowerCase().includes("cash"))
        )
        .reduce((sum, a) => sum + a.balance, 0),
      totalDebts
    );

    return NextResponse.json({
      metrics,
      finSightScore,
      categorySpending: categorySpending.sort((a, b) => b.amount - a.amount),
      diagnosis,
      lifestyleLeaks,
      wealthSuggestions,
      riskExposure,
      savingsGoals,
      netWorthHistory: netWorthSnapshots.reverse(),
    });
  } catch (error: any) {
    console.error("Growth metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error?.message },
      { status: 500 }
    );
  }
}
