"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Plus, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AddAccountModal } from "@/components/dashboard/add-account-modal";
import { toast } from "@/hooks/use-toast";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  bankName?: string;
  createdAt: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: "Account deleted",
        description: "The account has been removed.",
      });

      fetchAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Make sure there are no transactions linked to it.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const debitAccounts = accounts.filter((acc) => acc.type === "DEBIT");
  const creditAccounts = accounts.filter((acc) => acc.type === "CREDIT");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500">Manage your bank accounts and credit cards</p>
        </div>
        <Button onClick={() => setShowAddAccount(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-500 text-white border-0">
          <CardContent className="p-6">
            <p className="text-violet-100 text-sm font-medium">Total Balance</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
            <p className="text-violet-100 text-sm mt-2">{accounts.length} accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-6">
            <p className="text-blue-100 text-sm font-medium">Debit Accounts</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(debitAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
            </p>
            <p className="text-blue-100 text-sm mt-2">{debitAccounts.length} accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <p className="text-amber-100 text-sm font-medium">Credit Cards</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(creditAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
            </p>
            <p className="text-amber-100 text-sm mt-2">{creditAccounts.length} cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No accounts yet</h3>
            <p className="text-gray-500 mb-4">
              Add your first bank account or credit card to start tracking.
            </p>
            <Button onClick={() => setShowAddAccount(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className={`relative overflow-hidden ${
                account.type === "CREDIT"
                  ? "bg-gradient-to-br from-amber-50 to-orange-50"
                  : "bg-gradient-to-br from-blue-50 to-cyan-50"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {account.type === "CREDIT" ? (
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Wallet className="w-5 h-5 text-blue-600" />
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        account.type === "CREDIT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {account.type}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-rose-600"
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                  >
                    {deletingId === account.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{account.bankName || "Bank"}</p>
                <p className="text-xl font-semibold mt-1 text-gray-900">{account.name}</p>
                <p
                  className={`text-3xl font-bold mt-4 ${
                    account.balance >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(account.balance)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddAccountModal
        open={showAddAccount}
        onOpenChange={setShowAddAccount}
        onSuccess={() => {
          fetchAccounts();
          setShowAddAccount(false);
        }}
      />
    </div>
  );
}
