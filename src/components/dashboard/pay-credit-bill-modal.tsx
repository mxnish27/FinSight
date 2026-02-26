"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Building2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  bankName?: string;
  creditLimit?: number;
  currentOutstanding?: number;
  availableCredit?: number;
}

interface PayCreditBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  onSuccess: () => void;
}

export function PayCreditBillModal({
  open,
  onOpenChange,
  accounts,
  onSuccess,
}: PayCreditBillModalProps) {
  const [creditCardId, setCreditCardId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Support both old and new type names
  const creditCards = accounts.filter((a) => a.type === "CREDIT_CARD" || a.type === "CREDIT");
  const bankAccounts = accounts.filter((a) => a.type === "BANK" || a.type === "DEBIT");

  const selectedCreditCard = creditCards.find((c) => c.id === creditCardId);
  const selectedBankAccount = bankAccounts.find((b) => b.id === bankAccountId);

  // Use currentOutstanding for new accounts, fallback to negative balance for old accounts
  const outstandingAmount = selectedCreditCard 
    ? (selectedCreditCard.currentOutstanding ?? Math.abs(Math.min(0, selectedCreditCard.balance))) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!creditCardId || !bankAccountId || !amount) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (selectedBankAccount && paymentAmount > selectedBankAccount.balance) {
      toast({
        title: "Insufficient balance",
        description: `Your bank account only has ${formatCurrency(selectedBankAccount.balance)}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions/pay-credit-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditCardId,
          bankAccountId,
          amount: paymentAmount,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      toast({
        title: "💳 Payment Successful!",
        description: data.message,
      });

      // Reset form
      setCreditCardId("");
      setBankAccountId("");
      setAmount("");
      setDescription("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayFull = () => {
    if (outstandingAmount > 0) {
      setAmount(outstandingAmount.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            💳 Pay Credit Card Bill
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Credit Card Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Credit Card
            </label>
            <Select value={creditCardId} onValueChange={setCreditCardId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose credit card" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No credit cards found
                  </div>
                ) : (
                  creditCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <span>{card.name}</span>
                        <span className={`text-xs ml-auto ${card.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(card.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedCreditCard && selectedCreditCard.balance < 0 && (
              <p className="text-xs text-rose-600">
                Outstanding: {formatCurrency(Math.abs(selectedCreditCard.balance))}
              </p>
            )}
          </div>

          {/* Visual Arrow */}
          {creditCardId && bankAccountId && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-amber-50 rounded-full">
                <Building2 className="w-4 h-4 text-blue-600" />
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <CreditCard className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          )}

          {/* Bank Account Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Pay From Bank Account
            </label>
            <Select value={bankAccountId} onValueChange={setBankAccountId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose bank account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No bank accounts found
                  </div>
                ) : (
                  bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>{account.name}</span>
                        <span className="text-xs text-emerald-600 ml-auto">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedBankAccount && (
              <p className="text-xs text-gray-500">
                Available: {formatCurrency(selectedBankAccount.balance)}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Payment Amount
              </label>
              {outstandingAmount > 0 && (
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  Pay Full ({formatCurrency(outstandingAmount)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-11 text-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Note (Optional)
            </label>
            <Input
              placeholder="e.g., February bill payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && selectedBankAccount && selectedCreditCard && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{selectedBankAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{selectedCreditCard.name}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-violet-600">
                  {formatCurrency(parseFloat(amount))}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !creditCardId || !bankAccountId || !amount}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Bill
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
