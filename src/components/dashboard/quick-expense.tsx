"use client";

import { useState } from "react";
import { Plus, Coffee, ShoppingBag, Car, Utensils, Film, Zap, Loader2, CreditCard, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface QuickExpenseProps {
  accounts: Array<{ id: string; name: string; type?: string; bankName?: string }>;
  onExpenseAdded: () => void;
}

const QUICK_CATEGORIES = [
  { name: "Food", icon: Utensils, emoji: "🍔", color: "bg-orange-100 text-orange-600 hover:bg-orange-200" },
  { name: "Transport", icon: Car, emoji: "🚗", color: "bg-blue-100 text-blue-600 hover:bg-blue-200" },
  { name: "Shopping", icon: ShoppingBag, emoji: "🛍️", color: "bg-pink-100 text-pink-600 hover:bg-pink-200" },
  { name: "Coffee", icon: Coffee, emoji: "☕", color: "bg-amber-100 text-amber-600 hover:bg-amber-200" },
  { name: "Entertainment", icon: Film, emoji: "🎬", color: "bg-purple-100 text-purple-600 hover:bg-purple-200" },
  { name: "Utilities", icon: Zap, emoji: "⚡", color: "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" },
  { name: "Chitti", icon: CreditCard, emoji: "🏦", color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200" },
];

export function QuickExpense({ accounts, onExpenseAdded }: QuickExpenseProps) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const handleQuickAdd = async () => {
    if (!amount || !selectedCategory || !selectedAccountId) {
      toast({
        title: "Missing info",
        description: "Enter amount, select category & account",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type: "DEBIT",
          category: selectedCategory,
          description: `Quick ${selectedCategory}`,
          accountId: selectedAccountId,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error("Failed to add expense");

      const cat = QUICK_CATEGORIES.find(c => c.name === selectedCategory);
      toast({
        title: `${cat?.emoji || "✅"} Expense added!`,
        description: `₹${amount} for ${selectedCategory} from ${selectedAccount?.name}`,
      });

      setAmount("");
      setSelectedCategory(null);
      onExpenseAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (accounts.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">💸</span>
          Quick Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Account Selector */}
        <div className="mb-4">
          <div className="relative">
            <button
              onClick={() => setShowAccountPicker(!showAccountPicker)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-violet-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-violet-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{selectedAccount?.name || "Select Account"}</p>
                  <p className="text-xs text-gray-500">{selectedAccount?.bankName || selectedAccount?.type}</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAccountPicker ? 'rotate-180' : ''}`} />
            </button>
            
            {showAccountPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 overflow-hidden z-10">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccountId(account.id);
                      setShowAccountPicker(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-violet-50 transition-colors ${
                      account.id === selectedAccountId ? 'bg-violet-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.bankName || account.type}</p>
                    </div>
                    {account.id === selectedAccountId && (
                      <span className="ml-auto text-violet-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.name
                  ? `${cat.color} ring-2 ring-offset-1 ring-violet-400 scale-105`
                  : `${cat.color} opacity-80 hover:opacity-100`
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Amount & Submit */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">₹</span>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-xl font-bold h-14 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-400"
            />
          </div>
          <Button
            onClick={handleQuickAdd}
            disabled={isSubmitting || !amount || !selectedCategory || !selectedAccountId}
            className="h-14 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-base font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
