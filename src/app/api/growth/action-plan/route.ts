import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { generate30_60_90Plan, type FinancialMetrics, type CategorySpending } from "@/lib/financial-engine";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actionPlans = await prisma.actionPlan.findMany({
      where: { userId: user.userId },
      orderBy: [{ category: "asc" }, { priority: "asc" }],
    });

    return NextResponse.json({ actionPlans });
  } catch (error: any) {
    console.error("Action plan fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch action plans", details: error?.message },
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

    const body = await request.json();
    const { metrics, categorySpending } = body as {
      metrics: FinancialMetrics;
      categorySpending: CategorySpending[];
    };

    // Generate new action plans
    const diagnosis = { weaknesses: [], strengths: [], alerts: [], recommendations: [] };
    const plans = generate30_60_90Plan(metrics, diagnosis, categorySpending);

    // Clear existing plans and create new ones
    await prisma.actionPlan.deleteMany({
      where: { userId: user.userId },
    });

    const createdPlans = await Promise.all(
      plans.map((plan) =>
        prisma.actionPlan.create({
          data: {
            userId: user.userId,
            title: plan.title,
            description: plan.description,
            category: plan.category,
            priority: plan.priority,
            targetValue: plan.targetValue,
          },
        })
      )
    );

    return NextResponse.json({ actionPlans: createdPlans });
  } catch (error: any) {
    console.error("Action plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate action plans", details: error?.message },
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

    const { id, isCompleted, currentValue } = await request.json();

    const plan = await prisma.actionPlan.update({
      where: { id, userId: user.userId },
      data: {
        isCompleted,
        currentValue,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Action plan update error:", error);
    return NextResponse.json(
      { error: "Failed to update action plan", details: error?.message },
      { status: 500 }
    );
  }
}
