import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getMonthName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
}

export function getMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Travel",
  "EMI",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Family Transfer",
  "Groceries",
  "Fuel",
  "Rent",
  "Insurance",
  "Investment",
  "Salary",
  "Other Income",
  "Other",
] as const;

export const FAMILY_MEMBERS = ["Mummy", "Daddy", "Kedha", "Me"] as const;

export type Category = (typeof CATEGORIES)[number];
export type FamilyMember = (typeof FAMILY_MEMBERS)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#FF6384",
  "Shopping": "#36A2EB",
  "Travel": "#FFCE56",
  "EMI": "#4BC0C0",
  "Utilities": "#9966FF",
  "Entertainment": "#FF9F40",
  "Healthcare": "#FF6384",
  "Education": "#C9CBCF",
  "Family Transfer": "#7C3AED",
  "Groceries": "#10B981",
  "Fuel": "#F59E0B",
  "Rent": "#EF4444",
  "Insurance": "#8B5CF6",
  "Investment": "#06B6D4",
  "Salary": "#22C55E",
  "Other Income": "#84CC16",
  "Other": "#6B7280",
};
