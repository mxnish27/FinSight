import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        account: { userId: payload.userId },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Group transactions by date
    const dailyData: Record<string, { total: number; count: number; transactions: typeof transactions }> = {};
    
    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split("T")[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { total: 0, count: 0, transactions: [] };
      }
      if (t.type === "DEBIT") {
        dailyData[dateKey].total += t.amount;
      }
      dailyData[dateKey].count += 1;
      dailyData[dateKey].transactions.push(t);
    });

    // Calculate max spending for intensity scaling
    const maxSpending = Math.max(...Object.values(dailyData).map((d) => d.total), 1);

    // Build calendar data
    const daysInMonth = endDate.getDate();
    const firstDayOfWeek = startDate.getDay();
    
    const calendarData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = dailyData[dateKey] || { total: 0, count: 0, transactions: [] };
      const intensity = dayData.total > 0 ? Math.min(Math.ceil((dayData.total / maxSpending) * 4), 4) : 0;
      
      calendarData.push({
        day,
        date: dateKey,
        total: dayData.total,
        count: dayData.count,
        intensity,
        transactions: dayData.transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          category: t.category,
          description: t.description,
          merchant: t.merchant,
        })),
      });
    }

    return NextResponse.json({
      calendar: calendarData,
      firstDayOfWeek,
      month,
      year,
      maxSpending,
      totalSpent: Object.values(dailyData).reduce((sum, d) => sum + d.total, 0),
    });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
