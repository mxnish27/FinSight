"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, TrendingUp, TrendingDown, DollarSign, Shield, ChevronLeft, ChevronRight, Wallet, PieChart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface UserStats {
  id: string;
  name: string;
  email: string;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
  accountCount: number;
  topCategories: Array<{ category: string; amount: number }>;
}

interface OverallStats {
  totalUsers: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransactions: number;
  avgSavingsRate: number;
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

export default function AdminPage() {
  const [usersStats, setUsersStats] = useState<UserStats[]>([]);
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/all-users-stats?month=${month}&year=${year}`);
      if (response.status === 403) {
        setIsAdmin(false);
        setError("You don't have admin access. Only adminfinsight@gmail.com can view this.");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setUsersStats(data.users || []);
      setOverall(data.overall || null);
      setIsAdmin(true);
    } catch (err) {
      setError("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

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
  };

  const getSavingsColor = (rate: number) => {
    if (rate >= 20) return "text-emerald-600 bg-emerald-50";
    if (rate >= 10) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-rose-500" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900">🔒 Access Denied</h2>
            <p className="text-gray-600">
              {error || "You need admin privileges to access this page."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl sm:text-2xl lg:text-3xl">👑</span>
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all users&apos; monthly spending</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 self-start">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[90px] text-center">
            {monthNames[month - 1]} {year}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      {overall && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
          <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-gray-600">Users</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{overall.totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-600">Income</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 truncate">{formatCurrency(overall.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span className="text-xs text-gray-600">Expenses</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-rose-600 truncate">{formatCurrency(overall.totalExpenses)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600">Txns</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-blue-600">{overall.totalTransactions}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100 col-span-2 sm:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <PieChart className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-gray-600">Avg Savings</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-amber-600">{overall.avgSavingsRate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Spending Cards */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            📊 Users Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No user data for this month</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usersStats.map((user) => (
                <div 
                  key={user.id} 
                  className="border border-gray-100 rounded-xl overflow-hidden hover:border-violet-200 transition-colors"
                >
                  <button
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-11 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] sm:text-xs text-gray-500">Income</p>
                        <p className="font-semibold text-emerald-600 text-sm">{formatCurrency(user.totalIncome)}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] sm:text-xs text-gray-500">Spent</p>
                        <p className="font-semibold text-rose-600 text-sm">{formatCurrency(user.totalExpenses)}</p>
                      </div>
                      <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium shrink-0 ${getSavingsColor(user.savingsRate)}`}>
                        {user.savingsRate}%
                      </span>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedUser === user.id && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                        <div className="bg-white rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500">Balance</p>
                          <p className="font-semibold text-gray-900 text-sm truncate">{formatCurrency(user.totalBalance)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500">Accounts</p>
                          <p className="font-semibold text-gray-900 text-sm">{user.accountCount}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500">Transactions</p>
                          <p className="font-semibold text-gray-900 text-sm">{user.transactionCount}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500">Savings</p>
                          <p className={`font-semibold text-sm ${user.savingsRate >= 20 ? "text-emerald-600" : user.savingsRate >= 10 ? "text-amber-600" : "text-rose-600"}`}>
                            {formatCurrency(user.savings)}
                          </p>
                        </div>
                      </div>
                      
                      {user.topCategories.length > 0 && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Top Spending</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {user.topCategories.map((cat, i) => (
                              <span 
                                key={i}
                                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white border border-gray-200 text-xs sm:text-sm"
                              >
                                {CATEGORY_EMOJIS[cat.category] || "📦"} {cat.category}: {formatCurrency(cat.amount)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
