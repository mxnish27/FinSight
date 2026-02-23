import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.familyTransaction.findMany({
      where: { userId: authUser.userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Get family transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fromPerson, toPerson, amount, note, date } = await request.json();

    if (!fromPerson || !toPerson || !amount) {
      return NextResponse.json(
        { error: "From, to, and amount are required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.familyTransaction.create({
      data: {
        userId: authUser.userId,
        fromPerson,
        toPerson,
        amount: parseFloat(amount),
        note,
        date: new Date(date || Date.now()),
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Create family transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
