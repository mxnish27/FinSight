import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-gray-900" />
              <span className="text-lg font-bold text-gray-900">FinSight</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/register" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Simple way to track your money
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Track spending, see where your money goes, and get insights to save more. Built for families.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800">
              Start Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Income</p>
                <p className="text-xl font-bold text-emerald-600">₹1,25,000</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Expenses</p>
                <p className="text-xl font-bold text-red-500">₹78,500</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Savings</p>
                <p className="text-xl font-bold text-gray-900">₹46,500</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-end justify-between h-24 gap-2">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((height, i) => (
                  <div key={i} className="flex-1">
                    <div className="w-full bg-gray-300 rounded-sm hover:bg-gray-900 transition-colors" style={{ height: `${height}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Track Accounts", desc: "Add all your bank accounts and cards" },
              { title: "See Spending", desc: "Know where every rupee goes" },
              { title: "AI Insights", desc: "Get smart tips to save more" },
              { title: "Family Ledger", desc: "Track money between family members" },
            ].map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Start tracking today</h2>
          <p className="text-gray-600 mb-6">Free to use. No credit card required.</p>
          <Link href="/register" className="inline-flex items-center justify-center bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800">
            Create Free Account
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">FinSight</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
