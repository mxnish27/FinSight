import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "demo@finsight.com" },
    update: {},
    create: {
      email: "demo@finsight.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  console.log("✅ Created demo user:", user.email);

  // Create accounts
  const hdfcSavings = await prisma.account.create({
    data: {
      userId: user.id,
      name: "HDFC Savings",
      type: "DEBIT",
      balance: 125000,
      bankName: "HDFC Bank",
    },
  });

  const iciciCredit = await prisma.account.create({
    data: {
      userId: user.id,
      name: "ICICI Credit Card",
      type: "CREDIT",
      balance: -15000,
      bankName: "ICICI Bank",
    },
  });

  const sbiSavings = await prisma.account.create({
    data: {
      userId: user.id,
      name: "SBI Savings",
      type: "DEBIT",
      balance: 45000,
      bankName: "SBI",
    },
  });

  console.log("✅ Created 3 accounts");

  // Create transactions for the current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const transactions = [
    // Income
    {
      accountId: hdfcSavings.id,
      amount: 85000,
      type: "CREDIT",
      category: "Salary",
      description: "Monthly salary",
      merchant: "Employer",
      date: new Date(currentYear, currentMonth, 1),
    },
    {
      accountId: sbiSavings.id,
      amount: 15000,
      type: "CREDIT",
      category: "Other Income",
      description: "Freelance project",
      merchant: "Client",
      date: new Date(currentYear, currentMonth, 5),
    },
    // Expenses
    {
      accountId: hdfcSavings.id,
      amount: 12000,
      type: "DEBIT",
      category: "Rent",
      description: "Monthly rent",
      merchant: "Landlord",
      date: new Date(currentYear, currentMonth, 2),
    },
    {
      accountId: hdfcSavings.id,
      amount: 5500,
      type: "DEBIT",
      category: "Groceries",
      description: "Weekly groceries",
      merchant: "DMart",
      date: new Date(currentYear, currentMonth, 3),
    },
    {
      accountId: iciciCredit.id,
      amount: 8500,
      type: "DEBIT",
      category: "Shopping",
      description: "New clothes",
      merchant: "Myntra",
      date: new Date(currentYear, currentMonth, 7),
    },
    {
      accountId: hdfcSavings.id,
      amount: 2500,
      type: "DEBIT",
      category: "Utilities",
      description: "Electricity bill",
      merchant: "BESCOM",
      date: new Date(currentYear, currentMonth, 8),
    },
    {
      accountId: hdfcSavings.id,
      amount: 1200,
      type: "DEBIT",
      category: "Utilities",
      description: "Internet bill",
      merchant: "Airtel",
      date: new Date(currentYear, currentMonth, 8),
    },
    {
      accountId: iciciCredit.id,
      amount: 3500,
      type: "DEBIT",
      category: "Food & Dining",
      description: "Restaurant dinner",
      merchant: "Barbeque Nation",
      date: new Date(currentYear, currentMonth, 10),
    },
    {
      accountId: hdfcSavings.id,
      amount: 15000,
      type: "DEBIT",
      category: "EMI",
      description: "Car loan EMI",
      merchant: "HDFC Bank",
      date: new Date(currentYear, currentMonth, 5),
    },
    {
      accountId: sbiSavings.id,
      amount: 2000,
      type: "DEBIT",
      category: "Entertainment",
      description: "Movie tickets",
      merchant: "BookMyShow",
      date: new Date(currentYear, currentMonth, 12),
    },
    {
      accountId: hdfcSavings.id,
      amount: 4500,
      type: "DEBIT",
      category: "Fuel",
      description: "Petrol",
      merchant: "HP Petrol",
      date: new Date(currentYear, currentMonth, 14),
    },
    {
      accountId: iciciCredit.id,
      amount: 6000,
      type: "DEBIT",
      category: "Healthcare",
      description: "Doctor visit",
      merchant: "Apollo Hospital",
      date: new Date(currentYear, currentMonth, 15),
    },
    {
      accountId: hdfcSavings.id,
      amount: 3000,
      type: "DEBIT",
      category: "Groceries",
      description: "Vegetables and fruits",
      merchant: "BigBasket",
      date: new Date(currentYear, currentMonth, 16),
    },
    {
      accountId: sbiSavings.id,
      amount: 10000,
      type: "DEBIT",
      category: "Investment",
      description: "SIP investment",
      merchant: "Zerodha",
      date: new Date(currentYear, currentMonth, 1),
    },
  ];

  for (const txn of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        ...txn,
      },
    });
  }

  console.log(`✅ Created ${transactions.length} transactions`);

  // Create family transactions
  const familyTransactions = [
    {
      fromPerson: "Me",
      toPerson: "Mummy",
      amount: 5000,
      note: "Monthly contribution",
      date: new Date(currentYear, currentMonth, 1),
    },
    {
      fromPerson: "Daddy",
      toPerson: "Me",
      amount: 10000,
      note: "Birthday gift",
      date: new Date(currentYear, currentMonth, 10),
    },
    {
      fromPerson: "Me",
      toPerson: "Kedha",
      amount: 2000,
      note: "Pocket money",
      date: new Date(currentYear, currentMonth, 15),
    },
    {
      fromPerson: "Mummy",
      toPerson: "Kedha",
      amount: 1500,
      note: "School supplies",
      date: new Date(currentYear, currentMonth, 5),
    },
  ];

  for (const txn of familyTransactions) {
    await prisma.familyTransaction.create({
      data: {
        userId: user.id,
        ...txn,
      },
    });
  }

  console.log(`✅ Created ${familyTransactions.length} family transactions`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📧 Demo login credentials:");
  console.log("   Email: demo@finsight.com");
  console.log("   Password: demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
