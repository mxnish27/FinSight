import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: "desc" },
    });

    // Add computed fields for credit cards
    const accountsWithComputed = accounts.map((account) => {
      if (account.type === "CREDIT_CARD" && account.creditLimit) {
        return {
          ...account,
          availableCredit: account.creditLimit - account.currentOutstanding,
          utilization: Math.round((account.currentOutstanding / account.creditLimit) * 100),
        };
      }
      return account;
    });

    return NextResponse.json({ accounts: accountsWithComputed });
  } catch (error) {
    console.error("Get accounts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, balance, bankName, creditLimit } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Validate credit card requires credit limit
    if (type === "CREDIT_CARD" && (!creditLimit || creditLimit <= 0)) {
      return NextResponse.json(
        { error: "Credit limit is required for credit cards" },
        { status: 400 }
      );
    }

    // Create account with proper fields
    const account = await prisma.account.create({
      data: {
        userId: authUser.userId,
        name,
        type,
        balance: type === "BANK" ? (balance || 0) : 0,
        bankName: bankName || null,
        creditLimit: type === "CREDIT_CARD" ? creditLimit : null,
        currentOutstanding: type === "CREDIT_CARD" ? (balance || 0) : 0,
      },
    });

    // Add computed fields for response
    const response = {
      ...account,
      ...(type === "CREDIT_CARD" && creditLimit ? {
        availableCredit: creditLimit - (balance || 0),
        utilization: Math.round(((balance || 0) / creditLimit) * 100),
      } : {}),
    };

    return NextResponse.json({ account: response });
  } catch (error) {
    console.error("Create account error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
