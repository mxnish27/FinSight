"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, TrendingUp, TrendingDown, DollarSign, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: {
    accounts: number;
    transactions: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  description?: string;
  merchant?: string;
  date: string;
  user: { name: string | null; email: string };
  account: { name: string; type: string };
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  count: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.status === 403) {
        setIsAdmin(false);
        setError("You don't have admin access");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users || []);
      setIsAdmin(true);
    } catch (err) {
      setError("Failed to load admin data");
    }
  };

  const fetchTransactions = async (userId?: string) => {
    try {
      const url = userId && userId !== "all" 
        ? `/api/admin/transactions?userId=${userId}` 
        : "/api/admin/transactions";
      const response = await fetch(url);
      if (!response.ok) return;
      const data = await response.json();
      setTransactions(data.transactions || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchTransactions(selectedUser);
    }
  }, [isAdmin, selectedUser]);

  if (isLoading && !error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-neutral-500">
              {error || "You need admin privileges to access this page."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-neutral-600" />
            Admin Panel
          </h1>
          <p className="text-neutral-500 text-sm mt-1">View all users and transactions</p>
        </div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Total Income
              </div>
              <p className="text-xl font-semibold text-emerald-600">{formatCurrency(stats.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                Total Expenses
              </div>
              <p className="text-xl font-semibold text-red-500">{formatCurrency(stats.totalExpense)}</p>
            </CardContent>
          </Card>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Net Savings
              </div>
              <p className={`text-xl font-semibold ${stats.netSavings >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {formatCurrency(stats.netSavings)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                Total Users
              </div>
              <p className="text-xl font-semibold">{users.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users List */}
      <Card className="border-neutral-200 dark:border-neutral-800 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-2 px-3 font-medium text-neutral-500">User</th>
                  <th className="text-left py-2 px-3 font-medium text-neutral-500">Role</th>
                  <th className="text-center py-2 px-3 font-medium text-neutral-500">Accounts</th>
                  <th className="text-center py-2 px-3 font-medium text-neutral-500">Transactions</th>
                  <th className="text-left py-2 px-3 font-medium text-neutral-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-2.5 px-3">
                      <p className="font-medium">{user.name || "—"}</p>
                      <p className="text-xs text-neutral-400">{user.email}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        user.role === "ADMIN" 
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">{user._count.accounts}</td>
                    <td className="py-2.5 px-3 text-center">{user._count.transactions}</td>
                    <td className="py-2.5 px-3 text-neutral-500">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Recent Transactions {selectedUser !== "all" && "(Filtered)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center py-8 text-neutral-400">No transactions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-2 px-3 font-medium text-neutral-500">Date</th>
                    <th className="text-left py-2 px-3 font-medium text-neutral-500">User</th>
                    <th className="text-left py-2 px-3 font-medium text-neutral-500">Description</th>
                    <th className="text-left py-2 px-3 font-medium text-neutral-500">Category</th>
                    <th className="text-right py-2 px-3 font-medium text-neutral-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 50).map((txn) => (
                    <tr key={txn.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-2.5 px-3 text-neutral-500">{formatDate(txn.date)}</td>
                      <td className="py-2.5 px-3">
                        <p className="font-medium">{txn.user.name || txn.user.email}</p>
                        <p className="text-xs text-neutral-400">{txn.account.name}</p>
                      </td>
                      <td className="py-2.5 px-3">{txn.merchant || txn.description || "—"}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800">
                          {txn.category}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-medium ${
                        txn.type === "CREDIT" ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
