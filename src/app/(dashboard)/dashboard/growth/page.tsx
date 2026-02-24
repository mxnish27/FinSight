"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Calculator,
  PiggyBank,
  CreditCard,
  Wallet,
  ArrowRight,
  RefreshCw,
  Loader2,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react";

interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  netWorth: number;
  netWorthGrowth: number;
  budgetAdherence: number;
  expenseGrowthRate: number;
  discretionaryRatio: number;
  recurringExpenses: number;
  monthlySavings: number;
}

interface FinSightScore {
  total: number;
  savingsRateScore: number;
  budgetScore: number;
  debtScore: number;
  expenseTrendScore: number;
  status: "EXCELLENT" | "STABLE" | "RISKY" | "CRITICAL";
  statusColor: string;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
  budget?: number;
  overBudget: boolean;
}

interface Diagnosis {
  weaknesses: string[];
  strengths: string[];
  alerts: string[];
  recommendations: string[];
}

interface LifestyleLeak {
  type: string;
  description: string;
  amount: number;
  count: number;
  suggestion: string;
}

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  isCompleted: boolean;
  targetValue?: number;
  currentValue?: number;
}

interface FreedomProjection {
  targetAmount: number;
  yearsToReach: number;
  monthsToReach: number;
  onTrack: boolean;
}

export default function GrowthCenterPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [score, setScore] = useState<FinSightScore | null>(null);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [lifestyleLeaks, setLifestyleLeaks] = useState<LifestyleLeak[]>([]);
  const [wealthSuggestions, setWealthSuggestions] = useState<string[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [projections, setProjections] = useState<FreedomProjection[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationAmount, setSimulationAmount] = useState(5000);

  useEffect(() => {
    fetchGrowthData();
  }, []);

  const fetchGrowthData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/growth/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setScore(data.finSightScore);
        setCategorySpending(data.categorySpending || []);
        setDiagnosis(data.diagnosis);
        setLifestyleLeaks(data.lifestyleLeaks || []);
        setWealthSuggestions(data.wealthSuggestions || []);
      }

      const plansRes = await fetch("/api/growth/action-plan");
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setActionPlans(plansData.actionPlans || []);
      }

      if (metrics) {
        const monthlySavings = metrics.totalIncome - metrics.totalExpenses;
        const projRes = await fetch(
          `/api/growth/simulation?currentSavings=${metrics.netWorth}&monthlySavings=${monthlySavings}`
        );
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjections(projData.projections || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch growth data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (type: string) => {
    if (!metrics) return;
    try {
      const res = await fetch("/api/growth/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics,
          change: { type, amount: simulationAmount },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data.simulation);
      }
    } catch (error) {
      console.error("Simulation failed:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getScoreGradient = (status: string) => {
    switch (status) {
      case "EXCELLENT":
        return "from-emerald-500 to-green-600";
      case "STABLE":
        return "from-blue-500 to-indigo-600";
      case "RISKY":
        return "from-amber-500 to-orange-600";
      case "CRITICAL":
        return "from-red-500 to-rose-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-500">Analyzing your financial health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-violet-600" />
            Financial Growth Center
          </h1>
          <p className="text-gray-500 mt-1">
            Your personal CFO dashboard for wealth building
          </p>
        </div>
        <Button onClick={fetchGrowthData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Analysis
        </Button>
      </div>

      {/* FinSight Score Card */}
      {score && (
        <Card className={`mb-8 bg-gradient-to-r ${getScoreGradient(score.status)} text-white border-0 shadow-xl`}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">FinSight Score</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold">{score.total}</span>
                  <span className="text-2xl text-white/80">/ 100</span>
                </div>
                <p className="text-xl font-semibold mt-2">{score.status}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="text-center">
                  <p className="text-white/70 text-xs mb-1">Savings Rate</p>
                  <p className="text-2xl font-bold">{score.savingsRateScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-xs mb-1">Budget</p>
                  <p className="text-2xl font-bold">{score.budgetScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-xs mb-1">Debt</p>
                  <p className="text-2xl font-bold">{score.debtScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-xs mb-1">Expense Trend</p>
                  <p className="text-2xl font-bold">{score.expenseTrendScore}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-gray-500">Savings Rate</span>
              </div>
              <p className={`text-2xl font-bold ${metrics.savingsRate >= 20 ? "text-emerald-600" : metrics.savingsRate >= 10 ? "text-amber-600" : "text-rose-600"}`}>
                {metrics.savingsRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">Target: 20%+</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-rose-600" />
                <span className="text-sm text-gray-500">Debt Ratio</span>
              </div>
              <p className={`text-2xl font-bold ${metrics.debtToIncomeRatio <= 20 ? "text-emerald-600" : metrics.debtToIncomeRatio <= 35 ? "text-amber-600" : "text-rose-600"}`}>
                {metrics.debtToIncomeRatio.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">Target: &lt;20%</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-violet-600" />
                <span className="text-sm text-gray-500">Net Worth</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.netWorth)}
              </p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${metrics.netWorthGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {metrics.netWorthGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metrics.netWorthGrowth.toFixed(1)}% growth
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-500">Monthly Savings</span>
              </div>
              <p className={`text-2xl font-bold ${(metrics.monthlySavings || (metrics.totalIncome - metrics.totalExpenses)) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatCurrency(metrics.monthlySavings || (metrics.totalIncome - metrics.totalExpenses))}
              </p>
              <p className="text-xs text-gray-400 mt-1">Income - Expenses</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="diagnosis" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="diagnosis" className="rounded-lg data-[state=active]:bg-white">
            <AlertCircle className="w-4 h-4 mr-2" />
            Diagnosis
          </TabsTrigger>
          <TabsTrigger value="plan" className="rounded-lg data-[state=active]:bg-white">
            <Target className="w-4 h-4 mr-2" />
            Action Plan
          </TabsTrigger>
          <TabsTrigger value="wealth" className="rounded-lg data-[state=active]:bg-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Wealth Building
          </TabsTrigger>
          <TabsTrigger value="simulate" className="rounded-lg data-[state=active]:bg-white">
            <Calculator className="w-4 h-4 mr-2" />
            Simulate
          </TabsTrigger>
          <TabsTrigger value="freedom" className="rounded-lg data-[state=active]:bg-white">
            <Zap className="w-4 h-4 mr-2" />
            Freedom
          </TabsTrigger>
        </TabsList>

        {/* Diagnosis Tab */}
        <TabsContent value="diagnosis" className="space-y-6">
          {diagnosis && (
            <>
              {/* Alerts */}
              {diagnosis.alerts.length > 0 && (
                <Card className="border-rose-200 bg-rose-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-rose-700">
                      <AlertTriangle className="w-5 h-5" />
                      Critical Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {diagnosis.alerts.map((alert, i) => (
                        <li key={i} className="flex items-start gap-2 text-rose-700">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Weaknesses */}
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                      <TrendingDown className="w-5 h-5" />
                      Areas to Improve ({diagnosis.weaknesses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {diagnosis.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-start gap-2 text-amber-800">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                      {diagnosis.weaknesses.length === 0 && (
                        <p className="text-amber-600">No major weaknesses detected!</p>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      Strengths ({diagnosis.strengths.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {diagnosis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                      {diagnosis.strengths.length === 0 && (
                        <p className="text-emerald-600">Keep working to build your strengths!</p>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {diagnosis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Lifestyle Leaks */}
              {lifestyleLeaks.length > 0 && (
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Lifestyle Leaks Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lifestyleLeaks.map((leak, i) => (
                        <div key={i} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-amber-800">{leak.description}</p>
                            <span className="text-amber-700 font-bold">{formatCurrency(leak.amount)}</span>
                          </div>
                          <p className="text-sm text-amber-600">{leak.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="plan" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {["30_DAY", "60_DAY", "90_DAY"].map((period) => (
              <Card key={period} className="bg-white border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-900">
                    {period.replace("_", " ")} Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {actionPlans
                      .filter((p) => p.category === period)
                      .map((plan) => (
                        <li
                          key={plan.id}
                          className={`p-3 rounded-lg border ${
                            plan.isCompleted
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {plan.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <Target className="w-5 h-5 text-violet-600 flex-shrink-0" />
                            )}
                            <div>
                              <p className={`font-medium ${plan.isCompleted ? "text-emerald-700 line-through" : "text-gray-900"}`}>
                                {plan.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                              {plan.targetValue && (
                                <div className="mt-2">
                                  <Progress
                                    value={((plan.currentValue || 0) / plan.targetValue) * 100}
                                    className="h-2"
                                  />
                                  <p className="text-xs text-gray-400 mt-1">
                                    {plan.currentValue || 0} / {plan.targetValue}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    {actionPlans.filter((p) => p.category === period).length === 0 && (
                      <p className="text-gray-400 text-sm">No goals set for this period</p>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Wealth Building Tab */}
        <TabsContent value="wealth" className="space-y-6">
          <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-600" />
                Wealth Building Strategies
              </CardTitle>
              <p className="text-gray-500 text-sm">
                Educational suggestions to grow your wealth (not financial advice)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wealthSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-violet-100">
                    <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Allocation Suggestion */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Suggested Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-600">50%</p>
                  <p className="text-sm text-gray-600 mt-1">Equity Index Funds</p>
                  <p className="text-xs text-gray-400">Long-term growth</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">30%</p>
                  <p className="text-sm text-gray-600 mt-1">Debt Funds</p>
                  <p className="text-xs text-gray-400">Stability</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-3xl font-bold text-amber-600">20%</p>
                  <p className="text-sm text-gray-600 mt-1">Emergency Fund</p>
                  <p className="text-xs text-gray-400">Liquid safety</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulate" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-violet-600" />
                Scenario Simulator
              </CardTitle>
              <p className="text-gray-500 text-sm">
                See how changes impact your financial future
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Amount (₹)
                </label>
                <input
                  type="number"
                  value={simulationAmount}
                  onChange={(e) => setSimulationAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Button
                  onClick={() => runSimulation("INCREASE_SAVINGS")}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <PiggyBank className="w-4 h-4 mr-2" />
                  Increase Savings
                </Button>
                <Button
                  onClick={() => runSimulation("REDUCE_EXPENSE")}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Reduce Expenses
                </Button>
                <Button
                  onClick={() => runSimulation("INCREASE_INCOME")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Increase Income
                </Button>
              </div>

              {simulationResult && (
                <div className="p-6 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200">
                  <h3 className="font-semibold text-gray-900 mb-4">{simulationResult.scenario}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Annual Impact</p>
                      <p className="text-xl font-bold text-emerald-600">
                        +{formatCurrency(simulationResult.annualImpact)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">5-Year Impact</p>
                      <p className="text-xl font-bold text-emerald-600">
                        +{formatCurrency(simulationResult.fiveYearImpact)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Net Worth Change</p>
                      <p className="text-xl font-bold text-violet-600">
                        +{formatCurrency(simulationResult.netWorthChange)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">New Savings Rate</p>
                      <p className="text-xl font-bold text-blue-600">
                        {simulationResult.newSavingsRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Freedom Estimator Tab */}
        <TabsContent value="freedom" className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-600" />
                Financial Freedom Estimator
              </CardTitle>
              <p className="text-gray-500 text-sm">
                Based on your current savings rate and 10% annual returns
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { target: 1000000, label: "₹10 Lakh" },
                  { target: 5000000, label: "₹50 Lakh" },
                  { target: 10000000, label: "₹1 Crore" },
                  { target: 25000000, label: "₹2.5 Crore" },
                ].map((goal, i) => {
                  const projection = projections[i];
                  return (
                    <div
                      key={goal.target}
                      className="p-4 bg-white rounded-xl border border-amber-200 text-center"
                    >
                      <p className="text-lg font-bold text-gray-900">{goal.label}</p>
                      {projection ? (
                        <>
                          <p className="text-3xl font-bold text-amber-600 mt-2">
                            {projection.yearsToReach} yrs
                          </p>
                          <p className="text-sm text-gray-500">
                            {projection.monthsToReach} months
                          </p>
                          <p
                            className={`text-xs mt-2 ${
                              projection.onTrack ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {projection.onTrack ? "On Track ✓" : "Needs Attention"}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-400 mt-2">Calculating...</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {metrics && (
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Your Current Trajectory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Monthly Income</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(metrics.totalIncome)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Monthly Savings</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(metrics.totalIncome - metrics.totalExpenses)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Current Net Worth</p>
                    <p className="text-2xl font-bold text-violet-600">
                      {formatCurrency(metrics.netWorth)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
