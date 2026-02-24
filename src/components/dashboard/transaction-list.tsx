"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface TransactionListProps {
  onTransactionDeleted: () => void;
}

export function TransactionList({ onTransactionDeleted }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed.",
      });

      fetchTransactions();
      onTransactionDeleted();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    );
  }

  const filteredTransactions = transactions.filter(t => 
    filter === 'ALL' ? true : t.type === filter
  );

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'ALL' ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('CREDIT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('DEBIT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'DEBIT' ? 'bg-rose-100 text-rose-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Expense
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>{transactions.length === 0 ? 'No transactions yet. Add your first transaction to get started.' : 'No transactions match this filter.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.slice(0, 15).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white hover:bg-blue-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "CREDIT"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {transaction.type === "CREDIT" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.merchant || transaction.description || transaction.category}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[transaction.category] || "#6B7280"}20`,
                          color: CATEGORY_COLORS[transaction.category] || "#6B7280",
                        }}
                      >
                        {transaction.category}
                      </span>
                      <span>•</span>
                      <span>{transaction.account.name}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold ${
                      transaction.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {transaction.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                  >
                    {deletingId === transaction.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
