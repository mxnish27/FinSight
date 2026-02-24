import Link from "next/link";
import { ArrowRight, Wallet, TrendingUp, PieChart, Users, Sparkles, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FinSight</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-violet-700 hover:to-indigo-700 transition-all">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Smart Financial Tracking
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Take control of your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600"> finances</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            Track income, expenses, and savings effortlessly. Get AI-powered insights and build wealth with smart financial tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Dashboard */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 border border-gray-200">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4">
                <p className="text-xs text-emerald-600 font-medium mb-1">Income</p>
                <p className="text-2xl font-bold text-emerald-700">₹1,25,000</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-4">
                <p className="text-xs text-rose-600 font-medium mb-1">Expenses</p>
                <p className="text-2xl font-bold text-rose-700">₹78,500</p>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-4">
                <p className="text-xs text-violet-600 font-medium mb-1">Savings</p>
                <p className="text-2xl font-bold text-violet-700">₹46,500</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Savings Rate</p>
                <p className="text-2xl font-bold text-blue-700">37.2%</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-end justify-between h-32 gap-2">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div className="w-full bg-emerald-400 rounded-t-sm" style={{ height: `${height * 0.6}%` }} />
                    <div className="w-full bg-rose-400 rounded-b-sm" style={{ height: `${height * 0.4}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-500">
                <span>Jan</span>
                <span>Mar</span>
                <span>Jun</span>
                <span>Sep</span>
                <span>Dec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to manage money</h2>
            <p className="text-gray-600">Simple yet powerful tools to track, analyze, and grow your wealth</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Account Tracking</h3>
              <p className="text-sm text-gray-600">Track all bank accounts, cards, and wallets in one place</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Spending Analytics</h3>
              <p className="text-sm text-gray-600">Visual breakdown of where your money goes each month</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Growth Center</h3>
              <p className="text-sm text-gray-600">Financial health score and personalized improvement plans</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
              <p className="text-sm text-gray-600">Smart recommendations to optimize your spending</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Family Ledger</h3>
              <p className="text-sm text-gray-600">Track shared expenses and settle balances easily</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Goal Tracking</h3>
              <p className="text-sm text-gray-600">Set savings goals and track progress over time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Start your financial journey today</h2>
            <p className="text-violet-100 mb-8">Join thousands tracking their finances smarter</p>
            <Link href="/register" className="inline-flex items-center justify-center bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold hover:bg-violet-50 transition-all">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-md flex items-center justify-center">
              <Wallet className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">FinSight</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
