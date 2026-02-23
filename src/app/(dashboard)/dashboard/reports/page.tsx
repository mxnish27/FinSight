"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, CATEGORY_COLORS } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  description?: string;
  merchant?: string;
  date: string;
  account: {
    name: string;
    type: string;
  };
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryBreakdown: { category: string; amount: number }[];
}

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txnRes, statsRes] = await Promise.all([
        fetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`/api/stats?month=${selectedMonth}&year=${selectedYear}`),
      ]);

      const txnData = await txnRes.json();
      const statsData = await statsRes.json();

      setTransactions(txnData.transactions || []);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setAiSummary(null);
  }, [selectedMonth, selectedYear]);

  const generateAISummary = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setAiSummary(data.insights);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      toast({
        title: "No data",
        description: "No transactions to export for this period.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Type", "Category", "Merchant", "Description", "Account", "Amount"];
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.type,
      t.category,
      t.merchant || "",
      t.description || "",
      t.account.name,
      t.amount.toString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finsight-report-${selectedMonth}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Your CSV report has been downloaded.",
      variant: "success",
    });
  };

  const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">View and export your financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-emerald-500 text-white border-0">
              <CardContent className="p-6">
                <p className="text-emerald-100 text-sm font-medium">Total Income</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalIncome || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-rose-500 text-white border-0">
              <CardContent className="p-6">
                <p className="text-rose-100 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalExpense || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 text-white border-0">
              <CardContent className="p-6">
                <p className="text-violet-100 text-sm font-medium">Net Savings</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.netSavings || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-500 text-white border-0">
              <CardContent className="p-6">
                <p className="text-blue-100 text-sm font-medium">Transactions</p>
                <p className="text-2xl font-bold mt-1">{transactions.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Export & AI Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-600" />
                  Export Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4">
                  Download your {monthLabel} {selectedYear} transactions as a CSV file.
                </p>
                <Button onClick={exportCSV} className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiSummary ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {aiSummary}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 mb-4">
                      Generate an AI-powered summary for {monthLabel} {selectedYear}.
                    </p>
                    <Button onClick={generateAISummary} disabled={isGeneratingAI}>
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {stats && stats.categoryBreakdown.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.categoryBreakdown.map((item) => {
                    const percentage = stats.totalExpense > 0 
                      ? (item.amount / stats.totalExpense) * 100 
                      : 0;
                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-gray-500">
                            {formatCurrency(item.amount)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: CATEGORY_COLORS[item.category] || "#6B7280",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Transactions for {monthLabel} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found for this period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium">Date</th>
                        <th className="text-left py-3 px-2 font-medium">Description</th>
                        <th className="text-left py-3 px-2 font-medium">Category</th>
                        <th className="text-left py-3 px-2 font-medium">Account</th>
                        <th className="text-right py-3 px-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">{formatDate(txn.date)}</td>
                          <td className="py-3 px-2">
                            {txn.merchant || txn.description || "-"}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className="px-2 py-1 rounded-full text-xs"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[txn.category] || "#6B7280"}20`,
                                color: CATEGORY_COLORS[txn.category] || "#6B7280",
                              }}
                            >
                              {txn.category}
                            </span>
                          </td>
                          <td className="py-3 px-2">{txn.account.name}</td>
                          <td className={`py-3 px-2 text-right font-medium ${
                            txn.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {txn.type === "CREDIT" ? "+" : "-"}
                            {formatCurrency(txn.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
