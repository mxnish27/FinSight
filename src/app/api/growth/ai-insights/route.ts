import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FinancialData {
  income: number;
  expenses: number;
  savingsRate: number;
  debtRatio: number;
  netWorth: number;
  netWorthGrowth: number;
  budgetPerformance: number;
  expenseTrend: number;
  discretionaryRatio: number;
  recurringExpenses: number;
  topCategories: Array<{ category: string; amount: number; trend: number }>;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const financialData: FinancialData = await request.json();

    const prompt = `You are a personal financial advisor AI for FinSight app. Analyze this user's financial data and provide actionable, structured guidance.

FINANCIAL DATA:
- Monthly Income: ₹${financialData.income.toLocaleString()}
- Monthly Expenses: ₹${financialData.expenses.toLocaleString()}
- Savings Rate: ${financialData.savingsRate.toFixed(1)}%
- Debt-to-Income Ratio: ${financialData.debtRatio.toFixed(1)}%
- Net Worth: ₹${financialData.netWorth.toLocaleString()}
- Net Worth Growth (monthly): ${financialData.netWorthGrowth.toFixed(1)}%
- Budget Adherence: ${financialData.budgetPerformance.toFixed(0)}%
- Expense Growth Trend: ${financialData.expenseTrend.toFixed(1)}%
- Discretionary Spending Ratio: ${financialData.discretionaryRatio.toFixed(0)}%
- Recurring Expenses: ₹${financialData.recurringExpenses.toLocaleString()}
- Top Spending Categories: ${financialData.topCategories.map(c => `${c.category}: ₹${c.amount} (${c.trend > 0 ? '+' : ''}${c.trend.toFixed(0)}%)`).join(', ')}

Provide your analysis in the following JSON format:
{
  "healthSummary": "2-3 sentence overall financial health assessment",
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvements": [
    {"action": "specific action", "impact": "expected impact", "timeframe": "when to do it"},
    {"action": "specific action", "impact": "expected impact", "timeframe": "when to do it"},
    {"action": "specific action", "impact": "expected impact", "timeframe": "when to do it"},
    {"action": "specific action", "impact": "expected impact", "timeframe": "when to do it"},
    {"action": "specific action", "impact": "expected impact", "timeframe": "when to do it"}
  ],
  "wealthStrategies": [
    "wealth building strategy 1",
    "wealth building strategy 2", 
    "wealth building strategy 3"
  ],
  "habitChanges": [
    "daily/weekly habit to adopt",
    "habit to break",
    "mindset shift"
  ],
  "projectedImpact": "If user follows advice, expected improvement in 6 months"
}

IMPORTANT:
- Be specific with numbers and percentages
- Use Indian Rupee (₹) for all amounts
- Keep advice educational, not regulated financial advice
- Focus on actionable, practical steps
- Be encouraging but honest about areas needing improvement`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial wellness assistant. Always respond with valid JSON only, no markdown or extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    
    // Parse the JSON response
    let insights;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      insights = JSON.parse(cleanedResponse);
    } catch {
      // If parsing fails, return a structured error response
      insights = {
        healthSummary: "Unable to generate AI insights at this time. Please try again.",
        weaknesses: [],
        improvements: [],
        wealthStrategies: [],
        habitChanges: [],
        projectedImpact: "",
      };
    }

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error("AI insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insights", details: error?.message },
      { status: 500 }
    );
  }
}
