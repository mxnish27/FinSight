import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const debts = await prisma.debt.findMany({
      where: { userId: user.userId },
      orderBy: { interestRate: "desc" },
    });

    return NextResponse.json({ debts });
  } catch (error: any) {
    console.error("Debt fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts", details: error?.message },
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

    const { name, totalAmount, remainingAmount, interestRate = 0, minimumPayment = 0, dueDate } = await request.json();

    if (!name || !totalAmount) {
      return NextResponse.json(
        { error: "Name and total amount are required" },
        { status: 400 }
      );
    }

    const debt = await prisma.debt.create({
      data: {
        userId: user.userId,
        name,
        totalAmount,
        remainingAmount: remainingAmount ?? totalAmount,
        interestRate,
        minimumPayment,
        dueDate,
      },
    });

    return NextResponse.json({ debt });
  } catch (error: any) {
    console.error("Debt create error:", error);
    return NextResponse.json(
      { error: "Failed to create debt", details: error?.message },
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

    const { id, remainingAmount } = await request.json();

    const debt = await prisma.debt.update({
      where: { id, userId: user.userId },
      data: { remainingAmount, updatedAt: new Date() },
    });

    return NextResponse.json({ debt });
  } catch (error: any) {
    console.error("Debt update error:", error);
    return NextResponse.json(
      { error: "Failed to update debt", details: error?.message },
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
      return NextResponse.json({ error: "Debt ID required" }, { status: 400 });
    }

    await prisma.debt.delete({
      where: { id, userId: user.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Debt delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete debt", details: error?.message },
      { status: 500 }
    );
  }
}
