"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Flame,
  Target,
  Sparkles,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BudgetItem {
  id: string | null;
  category: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isUnbudgeted?: boolean;
}

interface CalendarDay {
  day: number;
  date: string;
  total: number;
  count: number;
  intensity: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    category: string;
    description?: string;
    merchant?: string;
  }>;
}

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Utilities: "⚡",
  Coffee: "☕",
  Health: "💊",
  Education: "📚",
  Groceries: "🛒",
  Rent: "🏠",
  Subscriptions: "📱",
  Travel: "✈️",
  Chitti: "🏦",
  Salary: "💰",
  Other: "📦",
};

const BUDGET_CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment", "Utilities", 
  "Coffee", "Health", "Groceries", "Rent", "Subscriptions", "Travel", "Chitti", "Other"
];

export default function BudgetPage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetRes, calendarRes] = await Promise.all([
        fetch(`/api/budgets?month=${month}&year=${year}`),
        fetch(`/api/transactions/calendar?month=${month}&year=${year}`),
      ]);

      const budgetData = await budgetRes.json();
      const calendarData = await calendarRes.json();

      setBudgets(budgetData.budgets || []);
      setSummary(budgetData.summary || null);
      setCalendar(calendarData.calendar || []);
      setFirstDayOfWeek(calendarData.firstDayOfWeek || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleAddBudget = async () => {
    if (!newBudgetCategory || !newBudgetAmount) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newBudgetCategory,
          amount: parseFloat(newBudgetAmount),
          month,
          year,
        }),
      });

      if (response.ok) {
        toast({ title: "✨ Budget set!", description: `${newBudgetCategory} budget added` });
        setShowAddBudget(false);
        setNewBudgetCategory("");
        setNewBudgetAmount("");
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add budget", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return "text-rose-600 bg-rose-50";
    if (percent >= 80) return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-rose-500";
    if (percent >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getIntensityColor = (intensity: number) => {
    const colors = [
      "bg-gray-100",
      "bg-rose-200",
      "bg-rose-300",
      "bg-rose-400",
      "bg-rose-500",
    ];
    return colors[intensity] || colors[0];
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: number) => {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDay(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const budgetedCategories = budgets.filter(b => !b.isUnbudgeted);
  const unbudgetedCategories = budgets.filter(b => b.isUnbudgeted);
  const warningBudgets = budgetedCategories.filter(b => b.percentUsed >= 80 && b.percentUsed < 100);
  const exceededBudgets = budgetedCategories.filter(b => b.percentUsed >= 100);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl">💰</span>
              Budget Planner
            </h1>
            <p className="text-sm text-gray-500 mt-1">Track your spending limits</p>
          </div>
          <Button 
            onClick={() => setShowAddBudget(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-1.5 h-9 px-3 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Set Budget</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Warning Banners */}
      {exceededBudgets.length > 0 && (
        <div className="mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-rose-700 text-sm sm:text-base">🚨 Budget Exceeded!</p>
              <p className="text-xs sm:text-sm text-rose-600 mt-0.5 sm:mt-1 truncate">
                {exceededBudgets.map(b => `${CATEGORY_EMOJIS[b.category] || "📦"} ${b.category}`).join(", ")} 
              </p>
            </div>
          </div>
        </div>
      )}

      {warningBudgets.length > 0 && (
        <div className="mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-amber-700 text-sm sm:text-base">⚠️ Approaching Limit</p>
              <p className="text-xs sm:text-sm text-amber-600 mt-0.5 sm:mt-1 truncate">
                {warningBudgets.map(b => `${CATEGORY_EMOJIS[b.category] || "📦"} ${b.category}`).join(", ")} at 80%+
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-gray-600">Budget</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{formatCurrency(summary.totalBudget)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <span className="text-xs text-gray-600">Spent</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-rose-600 truncate">{formatCurrency(summary.totalSpent)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-600">Left</span>
              </div>
              <p className={`text-lg sm:text-xl font-bold truncate ${summary.remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatCurrency(Math.abs(summary.remaining))}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600">Used</span>
              </div>
              <p className={`text-lg sm:text-xl font-bold ${summary.percentUsed >= 100 ? "text-rose-600" : summary.percentUsed >= 80 ? "text-amber-600" : "text-blue-600"}`}>
                {summary.percentUsed.toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Budget Categories */}
        <div>
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                📊 Category Budgets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-3 sm:px-6">
              {budgetedCategories.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-3 text-sm">No budgets set yet</p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddBudget(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add budget
                  </Button>
                </div>
              ) : (
                budgetedCategories.map((budget) => (
                  <div key={budget.category} className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${getStatusColor(budget.percentUsed)}`}>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="text-base sm:text-xl">{CATEGORY_EMOJIS[budget.category] || "📦"}</span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{budget.category}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold shrink-0">
                        {budget.percentUsed.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5 sm:mb-2">
                      <div 
                        className={`h-full rounded-full transition-all ${getProgressColor(budget.percentUsed)}`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 truncate">{formatCurrency(budget.spent)}</span>
                      <span className="text-gray-600 truncate">/ {formatCurrency(budget.budgetAmount)}</span>
                    </div>
                  </div>
                ))
              )}

              {unbudgetedCategories.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">💡 Unbudgeted:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {unbudgetedCategories.map((item) => (
                      <span 
                        key={item.category}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gray-100 text-xs sm:text-sm text-gray-700"
                      >
                        {CATEGORY_EMOJIS[item.category] || "📦"} {formatCurrency(item.spent)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expense Heatmap Calendar */}
        <div>
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                  🔥 <span className="hidden sm:inline">Spending</span> Heatmap
                </CardTitle>
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs sm:text-sm font-medium min-w-[70px] sm:min-w-[90px] text-center">
                    {monthNames[month - 1]} {year}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs text-gray-400 font-medium py-0.5">
                    {day.slice(0, 1)}<span className="hidden sm:inline">{day.slice(1)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Calendar days */}
                {calendar.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded sm:rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs transition-all hover:ring-1 sm:hover:ring-2 hover:ring-violet-400 ${
                      getIntensityColor(day.intensity)
                    } ${selectedDay?.day === day.day ? "ring-1 sm:ring-2 ring-violet-600" : ""}`}
                  >
                    <span className={`font-medium ${day.intensity > 2 ? "text-white" : "text-gray-700"}`}>
                      {day.day}
                    </span>
                    {day.count > 0 && (
                      <span className={`text-[8px] sm:text-[10px] ${day.intensity > 2 ? "text-white/80" : "text-gray-500"}`}>
                        {day.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-500">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${getIntensityColor(i)}`} />
                ))}
                <span>More</span>
              </div>

              {/* Selected day details */}
              {selectedDay && selectedDay.count > 0 && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {new Date(selectedDay.date).toLocaleDateString("en-IN", { 
                        weekday: "short", 
                        day: "numeric", 
                        month: "short" 
                      })}
                    </p>
                    <span className="text-xs sm:text-sm font-semibold text-rose-600">
                      {formatCurrency(selectedDay.total)}
                    </span>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {selectedDay.transactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="shrink-0">{CATEGORY_EMOJIS[t.category] || "📦"}</span>
                          <span className="text-gray-700 truncate">{t.merchant || t.description || t.category}</span>
                        </div>
                        <span className={`shrink-0 ml-2 ${t.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                          {t.type === "CREDIT" ? "+" : "-"}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">✨ Set Budget</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddBudget(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {BUDGET_CATEGORIES.filter(cat => !budgetedCategories.some(b => b.category === cat)).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewBudgetCategory(cat)}
                      className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        newBudgetCategory === cat
                          ? "bg-violet-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {CATEGORY_EMOJIS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                    className="pl-10 h-11 sm:h-12 text-base sm:text-lg"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddBudget}
                disabled={!newBudgetCategory || !newBudgetAmount || isSubmitting}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set Budget"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
