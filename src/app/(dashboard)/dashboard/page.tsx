"use client";

import { useEffect, useState } from "react";
import { Plus, TrendingDown, TrendingUp, Wallet, Loader2, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AddTransactionModal } from "@/components/dashboard/add-transaction-modal";
import { AddAccountModal } from "@/components/dashboard/add-account-modal";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { SpendingCharts } from "@/components/dashboard/spending-charts";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { QuickExpense } from "@/components/dashboard/quick-expense";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  bankName?: string;
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryBreakdown: { category: string; amount: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
  accountBalances: { name: string; balance: number; type: string }[];
  transactionCount: number;
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const fetchData = async () => {
    try {
      const [accountsRes, statsRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/stats"),
      ]);

      const accountsData = await accountsRes.json();
      const statsData = await statsRes.json();

      setAccounts(accountsData.accounts || []);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransactionAdded = () => {
    fetchData();
    setShowAddTransaction(false);
  };

  const handleAccountAdded = () => {
    fetchData();
    setShowAddAccount(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Track spending & insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 px-2.5 sm:px-3" onClick={() => setShowAddAccount(true)}>
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Account</span>
          </Button>
          <Button size="sm" className="h-9 px-2.5 sm:px-3" onClick={() => setShowAddTransaction(true)}>
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Transaction</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-xs sm:text-sm font-medium">Income</p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600 truncate">{formatCurrency(stats?.totalIncome || 0)}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">This month</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-xs sm:text-sm font-medium">Expenses</p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600" />
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-rose-600 truncate">{formatCurrency(stats?.totalExpense || 0)}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">This month</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-xs sm:text-sm font-medium">Savings</p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600" />
            </div>
          </div>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${(stats?.netSavings || 0) >= 0 ? 'text-violet-600' : 'text-rose-600'}`}>
            {formatCurrency(stats?.netSavings || 0)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Net</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-xs sm:text-sm font-medium">Rate</p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <PieChart className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
          </div>
          {(() => {
            const rate = stats?.totalIncome ? ((stats.netSavings / stats.totalIncome) * 100) : 0;
            return (
              <>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${rate >= 20 ? 'text-emerald-600' : rate >= 10 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {rate.toFixed(0)}%
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{rate >= 20 ? 'Great!' : rate >= 10 ? 'Good' : 'Improve'}</p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Accounts Overview */}
      <Card className="mb-6 border border-gray-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-gray-900 text-base sm:text-lg">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            Accounts
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setShowAddAccount(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {accounts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Wallet className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No accounts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
                    account.type === "CREDIT"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">{account.bankName || account.type}</span>
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
                      account.type === "CREDIT" 
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {account.type}
                    </span>
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{account.name}</p>
                  <p className={`text-lg sm:text-xl font-bold mt-1 truncate ${account.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Expense */}
      <QuickExpense accounts={accounts} onExpenseAdded={fetchData} />

      {/* Charts Section */}
      {stats && stats.transactionCount > 0 && (
        <SpendingCharts
          categoryBreakdown={stats.categoryBreakdown}
          monthlyTrend={stats.monthlyTrend}
        />
      )}

      {/* AI Insights Section */}
      <AIInsights />

      {/* Recent Transactions */}
      <TransactionList onTransactionDeleted={fetchData} />

      {/* Modals */}
      <AddTransactionModal
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        accounts={accounts}
        onSuccess={handleTransactionAdded}
      />

      <AddAccountModal
        open={showAddAccount}
        onOpenChange={setShowAddAccount}
        onSuccess={handleAccountAdded}
      />
    </div>
  );
}
