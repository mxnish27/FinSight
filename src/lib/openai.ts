import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export interface SpendingData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryBreakdown: { category: string; amount: number }[];
  topMerchants: { merchant: string; amount: number }[];
  monthYear: string;
}

export async function generateFinancialInsights(data: SpendingData): Promise<string> {
  const prompt = `You are a personal finance advisor. Analyze the following monthly spending data and provide actionable insights.

Monthly Financial Summary for ${data.monthYear}:
- Total Income: ₹${data.totalIncome.toLocaleString()}
- Total Expenses: ₹${data.totalExpense.toLocaleString()}
- Net Savings: ₹${data.netSavings.toLocaleString()}

Category-wise Spending:
${data.categoryBreakdown.map((c) => `- ${c.category}: ₹${c.amount.toLocaleString()}`).join("\n")}

Top Merchants/Places:
${data.topMerchants.map((m) => `- ${m.merchant}: ₹${m.amount.toLocaleString()}`).join("\n")}

Please provide:
1. **Spending Analysis** (2-3 sentences)
2. **Warnings** - Any overspending areas (if applicable)
3. **Savings Suggestions** (2-3 actionable tips)
4. **Budget Recommendations** for next month
5. **Financial Behavior Summary** (1-2 sentences)

Keep the response concise, practical, and formatted with clear sections. Use bullet points where appropriate.`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful personal finance advisor. Provide concise, actionable financial insights. Format your response with clear sections and bullet points.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Unable to generate insights at this time.";
  } catch (error: unknown) {
    console.error("OpenAI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return `Unable to generate insights: ${errorMessage}`;
  }
}

export async function generateMonthlySummary(data: SpendingData): Promise<string> {
  const prompt = `Summarize this month's (${data.monthYear}) financial activity in 2-3 sentences:
- Income: ₹${data.totalIncome.toLocaleString()}
- Expenses: ₹${data.totalExpense.toLocaleString()}
- Top spending: ${data.categoryBreakdown.slice(0, 3).map((c) => c.category).join(", ")}

Be concise and highlight the key takeaway.`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Unable to generate summary.";
  } catch (error: unknown) {
    console.error("OpenAI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return `Unable to generate summary: ${errorMessage}`;
  }
}
