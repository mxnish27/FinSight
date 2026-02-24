"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, FileText, Home, LogOut, TrendingUp, Users, Wallet, PiggyBank, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/budget", label: "Budget", icon: PiggyBank },
  { href: "/dashboard/growth", label: "Growth", icon: TrendingUp },
  { href: "/dashboard/accounts", label: "Accounts", icon: CreditCard },
  { href: "/dashboard/family", label: "Family", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user?.role === "ADMIN" || data.user?.email === "adminfinsight@gmail.com") {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast({ title: "Logged out", description: "You have been successfully logged out." });
      router.push("/");
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  const allNavItems = isAdmin 
    ? [...navItems, { href: "/dashboard/admin", label: "Admin", icon: Shield }]
    : navItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              <span className="text-base sm:text-lg font-bold text-gray-900">FinSight</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {allNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex items-center justify-around px-1 py-1">
          {allNavItems.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg min-w-[52px] ${
                pathname === item.href
                  ? "text-violet-600"
                  : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg min-w-[52px] ${
                pathname === "/dashboard/admin"
                  ? "text-violet-600"
                  : "text-gray-500"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px] font-medium">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
