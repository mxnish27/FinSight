import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: user.userId },
      orderBy: [{ status: "asc" }, { priority: "asc" }],
    });

    return NextResponse.json({ savingsGoals });
  } catch (error: any) {
    console.error("Savings goals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings goals", details: error?.message },
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

    const { name, targetAmount, currentAmount = 0, deadline, priority = "MEDIUM" } = await request.json();

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: "Name and target amount are required" },
        { status: 400 }
      );
    }

    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        userId: user.userId,
        name,
        targetAmount,
        currentAmount,
        deadline: deadline ? new Date(deadline) : null,
        priority,
      },
    });

    return NextResponse.json({ savingsGoal });
  } catch (error: any) {
    console.error("Savings goal create error:", error);
    return NextResponse.json(
      { error: "Failed to create savings goal", details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, currentAmount, status } = await request.json();

    const updateData: any = { updatedAt: new Date() };
    if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
    if (status) updateData.status = status;

    const savingsGoal = await prisma.savingsGoal.update({
      where: { id, userId: user.userId },
      data: updateData,
    });

    return NextResponse.json({ savingsGoal });
  } catch (error: any) {
    console.error("Savings goal update error:", error);
    return NextResponse.json(
      { error: "Failed to update savings goal", details: error?.message },
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
      return NextResponse.json({ error: "Savings goal ID required" }, { status: 400 });
    }

    await prisma.savingsGoal.delete({
      where: { id, userId: user.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Savings goal delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete savings goal", details: error?.message },
      { status: 500 }
    );
  }
}
