import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomeSources = await prisma.incomeSource.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ incomeSources });
  } catch (error: any) {
    console.error("Income fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch income sources", details: error?.message },
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

    const { name, amount, frequency = "MONTHLY", isActive = true } = await request.json();

    if (!name || !amount) {
      return NextResponse.json(
        { error: "Name and amount are required" },
        { status: 400 }
      );
    }

    const incomeSource = await prisma.incomeSource.create({
      data: {
        userId: user.userId,
        name,
        amount,
        frequency,
        isActive,
      },
    });

    return NextResponse.json({ incomeSource });
  } catch (error: any) {
    console.error("Income create error:", error);
    return NextResponse.json(
      { error: "Failed to create income source", details: error?.message },
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
      return NextResponse.json({ error: "Income source ID required" }, { status: 400 });
    }

    await prisma.incomeSource.delete({
      where: { id, userId: user.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Income delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete income source", details: error?.message },
      { status: 500 }
    );
  }
}
