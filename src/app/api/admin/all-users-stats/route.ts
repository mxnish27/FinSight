import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "adminfinsight@gmail.com";

interface UserTransaction {
  amount: number;
  type: string;
  category: string;
  date: Date;
}

interface UserAccount {
  id: string;
  balance: number;
  transactions: UserTransaction[];
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  accounts: UserAccount[];
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

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, role: true },
    });

    if (!currentUser || (currentUser.email !== ADMIN_EMAIL && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get all users with their accounts and transactions for the month
    const users: UserData[] = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        accounts: {
          select: {
            id: true,
            balance: true,
            transactions: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              select: {
                amount: true,
                type: true,
                category: true,
                date: true,
              },
            },
          },
        },
      },
    });

    // Process each user's data
    const usersStats = users.map((user: UserData) => {
      let totalIncome = 0;
      let totalExpenses = 0;
      const categorySpending: Record<string, number> = {};
      let transactionCount = 0;

      user.accounts.forEach((account: UserAccount) => {
        account.transactions.forEach((t: UserTransaction) => {
          transactionCount++;
          if (t.type === "CREDIT") {
            totalIncome += t.amount;
          } else {
            totalExpenses += t.amount;
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
          }
        });
      });

      const totalBalance = user.accounts.reduce((sum: number, acc: UserAccount) => sum + acc.balance, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

      // Get top spending categories
      const topCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }));

      return {
        id: user.id,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        totalBalance,
        totalIncome,
        totalExpenses,
        savings: totalIncome - totalExpenses,
        savingsRate: Math.round(savingsRate),
        transactionCount,
        topCategories,
        accountCount: user.accounts.length,
      };
    });

    // Sort by total expenses (highest first)
    usersStats.sort((a, b) => b.totalExpenses - a.totalExpenses);

    // Calculate overall stats
    const overallStats = {
      totalUsers: users.length,
      totalIncome: usersStats.reduce((sum, u) => sum + u.totalIncome, 0),
      totalExpenses: usersStats.reduce((sum, u) => sum + u.totalExpenses, 0),
      totalTransactions: usersStats.reduce((sum, u) => sum + u.transactionCount, 0),
      avgSavingsRate: usersStats.length > 0 
        ? Math.round(usersStats.reduce((sum, u) => sum + u.savingsRate, 0) / usersStats.length)
        : 0,
    };

    return NextResponse.json({
      users: usersStats,
      overall: overallStats,
      month,
      year,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
