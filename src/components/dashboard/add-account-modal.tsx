"use client";

import { useState } from "react";
import { Loader2, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "SBI",
  "Axis Bank",
  "Kotak Mahindra",
  "Yes Bank",
  "Canara Bank",
  "Other",
];

export function AddAccountModal({
  open,
  onOpenChange,
  onSuccess,
}: AddAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "BANK",
    balance: "",
    bankName: "",
    creditLimit: "",
  });

  const isCreditCard = formData.type === "CREDIT_CARD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate credit limit for credit cards
      if (isCreditCard && (!formData.creditLimit || parseFloat(formData.creditLimit) <= 0)) {
        throw new Error("Credit limit is required for credit cards");
      }

      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          bankName: formData.bankName,
          // For BANK: balance = available money
          // For CREDIT_CARD: balance = current outstanding (amount owed)
          balance: parseFloat(formData.balance) || 0,
          creditLimit: isCreditCard ? parseFloat(formData.creditLimit) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add account");
      }

      toast({
        title: isCreditCard ? "💳 Credit Card Added" : "🏦 Account Added",
        description: `${formData.name} has been added successfully.`,
      });

      setFormData({
        name: "",
        type: "BANK",
        balance: "",
        bankName: "",
        creditLimit: "",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreditCard ? (
              <><CreditCard className="w-5 h-5 text-amber-600" /> Add Credit Card</>
            ) : (
              <><Building2 className="w-5 h-5 text-blue-600" /> Add Bank Account</>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCreditCard 
              ? "Add a credit card to track spending and bill payments."
              : "Add a bank account to track your balance and transactions."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value, balance: "", creditLimit: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Bank / Savings Account
                  </div>
                </SelectItem>
                <SelectItem value="CREDIT_CARD">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    Credit Card
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder={isCreditCard ? "e.g., HDFC Regalia, SBI SimplyCLICK" : "e.g., HDFC Savings, SBI Salary"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank / Card Issuer</Label>
            <Select
              value={formData.bankName}
              onValueChange={(value) => setFormData({ ...formData, bankName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCreditCard ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g., 100000"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Maximum credit limit on your card
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Current Outstanding (₹)</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Amount you currently owe (leave 0 if no dues)
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance (₹)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Available balance in your account
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`flex-1 ${isCreditCard ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>Add {isCreditCard ? "Card" : "Account"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
