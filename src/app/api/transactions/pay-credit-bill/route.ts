import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// POST /api/transactions/pay-credit-bill
// Pay credit card bill from a bank account
// This is a LIABILITY SETTLEMENT - NOT an expense
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creditCardId, bankAccountId, amount, description } = await request.json();

    if (!creditCardId || !bankAccountId || !amount) {
      return NextResponse.json(
        { error: "Credit card, bank account, and amount are required" },
        { status: 400 }
      );
    }

    let paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Verify credit card belongs to user - support both old "CREDIT" and new "CREDIT_CARD" types
    const creditCard = await prisma.account.findFirst({
      where: { 
        id: creditCardId, 
        userId: authUser.userId, 
        type: { in: ["CREDIT_CARD", "CREDIT"] } 
      },
    }) as Record<string, unknown> | null;

    if (!creditCard) {
      return NextResponse.json(
        { error: "Credit card not found" },
        { status: 404 }
      );
    }

    // Verify bank account belongs to user - support both old "DEBIT" and new "BANK" types
    const bankAccount = await prisma.account.findFirst({
      where: { 
        id: bankAccountId, 
        userId: authUser.userId, 
        type: { in: ["BANK", "DEBIT"] } 
      },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    // Check if bank account has sufficient balance
    if (bankAccount.balance < paymentAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₹${bankAccount.balance.toLocaleString("en-IN")}` },
        { status: 400 }
      );
    }

    // Get current outstanding - use new field or fallback to negative balance
    const currentOutstanding = (creditCard.currentOutstanding as number) || Math.abs(Math.min(0, creditCard.balance as number));
    
    // Cap payment at current outstanding (prevent overpayment)
    if (paymentAmount > currentOutstanding) {
      paymentAmount = currentOutstanding;
    }

    // If nothing to pay
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: "No outstanding balance to pay" },
        { status: 400 }
      );
    }

    const now = new Date();
    const creditCardName = creditCard.name as string;
    const creditCardBankName = creditCard.bankName as string | null;
    const creditLimit = (creditCard.creditLimit as number) || 0;
    const paymentDescription = description || `Credit Card Bill Payment - ${creditCardName}`;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create transfer record on bank account (money going out for bill payment)
      // transactionType: "CREDIT_CARD_PAYMENT" - NOT counted as expense or income
      const bankTransaction = await tx.transaction.create({
        data: {
          userId: authUser.userId,
          accountId: bankAccountId,
          amount: paymentAmount,
          type: "DEBIT",
          transactionType: "CREDIT_CARD_PAYMENT", // Excluded from income/expense calculations
          category: "Bill Payment",
          description: paymentDescription,
          merchant: creditCardBankName || creditCardName,
          date: now,
        },
      });

      // 2. Create payment received record on credit card
      // This is NOT income - it's a liability settlement
      const creditTransaction = await tx.transaction.create({
        data: {
          userId: authUser.userId,
          accountId: creditCardId,
          amount: paymentAmount,
          type: "CREDIT",
          transactionType: "CREDIT_CARD_PAYMENT", // Excluded from income/expense calculations
          category: "Bill Payment",
          description: `Payment from ${bankAccount.bankName || bankAccount.name}`,
          merchant: bankAccount.bankName || bankAccount.name,
          date: now,
        },
      });

      // 3. Update bank account balance (decrease)
      await tx.account.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: paymentAmount } },
      });

      // 4. Update credit card outstanding (decrease - reducing debt)
      // Use raw update to handle the new field
      await tx.$executeRaw`UPDATE "Account" SET "currentOutstanding" = "currentOutstanding" - ${paymentAmount} WHERE id = ${creditCardId}`;

      return { bankTransaction, creditTransaction };
    });

    // Calculate new outstanding
    const newOutstanding = currentOutstanding - paymentAmount;
    const availableCredit = creditLimit - newOutstanding;

    return NextResponse.json({
      success: true,
      message: `Successfully paid ₹${paymentAmount.toLocaleString("en-IN")} to ${creditCard.name}`,
      transactions: result,
      newOutstanding,
      availableCredit,
    });
  } catch (error) {
    console.error("Pay credit bill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/transactions/pay-credit-bill
// Get credit card payment history
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all bill payment transactions (liability settlements)
    const payments = await prisma.transaction.findMany({
      where: {
        userId: authUser.userId,
        category: "Bill Payment",
      },
      include: { account: true },
      orderBy: { date: "desc" },
      take: 50,
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Get credit payments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
