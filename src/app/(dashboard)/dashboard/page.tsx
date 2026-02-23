"use client";

import { useEffect, useState } from "react";
import { Plus, TrendingDown, TrendingUp, Wallet, Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AddTransactionModal } from "@/components/dashboard/add-transaction-modal";
import { AddAccountModal } from "@/components/dashboard/add-account-modal";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { SpendingCharts } from "@/components/dashboard/spending-charts";
import { AIInsights } from "@/components/dashboard/ai-insights";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Track your spending and get insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowAddAccount(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
          <Button onClick={() => setShowAddTransaction(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Income</p>
              <p className="text-3xl font-bold mt-1 text-emerald-600">{formatCurrency(stats?.totalIncome || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold mt-1 text-red-500">{formatCurrency(stats?.totalExpense || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Net Savings</p>
              <p className={`text-3xl font-bold mt-1 ${(stats?.netSavings || 0) >= 0 ? 'text-gray-900' : 'text-red-500'}`}>{formatCurrency(stats?.netSavings || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Overview */}
      <Card className="mb-8 border border-gray-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Wallet className="w-5 h-5 text-gray-600" />
            Your Accounts
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowAddAccount(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No accounts yet. Add your first account to start tracking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 rounded-xl border ${
                    account.type === "CREDIT"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{account.bankName || account.type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      account.type === "CREDIT" 
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {account.type}
                    </span>
                  </div>
                  <p className="font-semibold text-lg text-gray-900">{account.name}</p>
                  <p className={`text-2xl font-bold mt-2 ${account.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
