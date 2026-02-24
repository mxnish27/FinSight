import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { simulateScenario, calculateMultipleFreedomTargets, type FinancialMetrics } from "@/lib/financial-engine";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { metrics, change } = await request.json() as {
      metrics: FinancialMetrics;
      change: {
        type: 'INCREASE_SAVINGS' | 'REDUCE_EXPENSE' | 'INCREASE_INCOME';
        amount: number;
        category?: string;
      };
    };

    const result = simulateScenario(metrics, change);

    return NextResponse.json({ simulation: result });
  } catch (error: any) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Failed to run simulation", details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currentSavings = parseFloat(searchParams.get("currentSavings") || "0");
    const monthlySavings = parseFloat(searchParams.get("monthlySavings") || "0");

    const projections = calculateMultipleFreedomTargets(currentSavings, monthlySavings);

    return NextResponse.json({ projections });
  } catch (error: any) {
    console.error("Freedom projection error:", error);
    return NextResponse.json(
      { error: "Failed to calculate projections", details: error?.message },
      { status: 500 }
    );
  }
}
