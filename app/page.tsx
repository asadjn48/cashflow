// // src/app/page.tsx
// import { redirect } from "next/navigation";

// export default function Home() {
//   redirect("/dashboard");
// }










"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider"; // Make sure path matches your project
import Link from "next/link";
import { Wallet, ArrowRight, ShieldCheck, PieChart, Globe } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 1. Auto-Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[hsl(var(--primary))] rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            CashFlow
          </span>
        </div>
        <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-full font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              Log In
            </Link>
            <Link 
              href="/login" // Or /signup if you have it
              className="px-5 py-2.5 rounded-full font-medium bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-all shadow-lg shadow-blue-500/30"
            >
              Get Started
            </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8 border border-blue-100 dark:border-blue-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 is Live with Multi-Currency Support
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 max-w-4xl">
          Master your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Business Finances</span> with confidence.
        </h1>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Track income, manage expenses, and automate your savings rules. 
          The professional dashboard for modern entrepreneurs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link 
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto w-full px-4">
            {[
                { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Your financial data is encrypted and secure with Firebase Auth." },
                { icon: PieChart, title: "Smart Analytics", desc: "Real-time profit/loss calculation with visual charts." },
                { icon: Globe, title: "Multi-Currency", desc: "Support for USD, PKR, EUR, GBP with auto-conversion." }
            ].map((f, i) => (
                <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-left">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                        <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
            ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 dark:border-slate-800">
        © {new Date().getFullYear()} CashFlow Dashboard. All rights reserved.
      </footer>
    </div>
  );
}