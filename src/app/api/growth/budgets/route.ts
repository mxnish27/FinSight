import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId: user.userId },
      orderBy: { category: "asc" },
    });

    return NextResponse.json({ budgets });
  } catch (error: any) {
    console.error("Budget fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, amount, period = "MONTHLY" } = await request.json();

    if (!category || !amount) {
      return NextResponse.json(
        { error: "Category and amount are required" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId: user.userId,
          category,
        },
      },
      update: { amount, period },
      create: {
        userId: user.userId,
        category,
        amount,
        period,
      },
    });

    return NextResponse.json({ budget });
  } catch (error: any) {
    console.error("Budget create error:", error);
    return NextResponse.json(
      { error: "Failed to create budget", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Budget ID required" }, { status: 400 });
    }

    await prisma.budget.delete({
      where: { id, userId: user.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Budget delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete budget", details: error?.message },
      { status: 500 }
    );
  }
}
