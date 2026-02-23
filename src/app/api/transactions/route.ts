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
    const accountId = searchParams.get("accountId");

    const whereClause: Record<string, unknown> = { userId: authUser.userId };

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      whereClause.date = { gte: startDate, lte: endDate };
    }

    if (accountId) {
      whereClause.accountId = accountId;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: { account: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountId, amount, type, category, description, merchant, date } =
      await request.json();

    if (!accountId || !amount || !type || !category) {
      return NextResponse.json(
        { error: "Account, amount, type, and category are required" },
        { status: 400 }
      );
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: authUser.userId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: authUser.userId,
        accountId,
        amount: parseFloat(amount),
        type,
        category,
        description,
        merchant,
        date: new Date(date || Date.now()),
      },
      include: { account: true },
    });

    // Update account balance
    const balanceChange = type === "CREDIT" ? parseFloat(amount) : -parseFloat(amount);
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: balanceChange } },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
