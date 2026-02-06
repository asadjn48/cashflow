"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";
import Link from "next/link";
import { Wallet, ArrowRight, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auto-Redirect if logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="h-screen bg-white dark:bg-slate-950 flex flex-col overflow-hidden relative selection:bg-blue-100 selection:text-blue-900">
      
      {/* Subtle Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-125 h-125 bg-cyan-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar - Slim & Minimal */}
      <nav className="p-6 flex justify-between items-center w-full max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[hsl(var(--primary))] rounded-xl shadow-lg shadow-blue-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            CashFlow<span className="text-slate-400 font-normal">.Admin</span>
          </span>
        </div>
        
        {/* Simple Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Operational
        </div>
      </nav>

      {/* Main Content - Perfectly Centered */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-100 dark:border-blue-800 shadow-sm">
            <LayoutDashboard className="w-4 h-4" />
            {/* <span>v2.0 Professional Edition</span> */}
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 max-w-3xl leading-tight">
          Financial Control <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
            Simplified.
          </span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mb-10 leading-relaxed">
          Secure admin access for managing business portfolios, tracking real-time profits, and optimizing savings.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          {user ? (
             <Link 
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--primary))] text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20"
              >
                Enter Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
          ) : (
              <>
                <Link 
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Log In
                </Link>
              </>
          )}
        </div>

      </main>

      {/* Footer - Minimal & Pinned */}
      <footer className="py-6 text-center z-10">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Private Admin Console. Secure Connection.
        </p>
      </footer>
    </div>
  );
}