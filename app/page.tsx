// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/src/components/AuthProvider";
// import Link from "next/link";
// import { Wallet, ArrowRight, LayoutDashboard } from "lucide-react";

// export default function LandingPage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   // Auto-Redirect if logged in
//   useEffect(() => {
//     if (!loading && user) {
//       router.push("/dashboard");
//     }
//   }, [user, loading, router]);

//   return (
//     <div className="h-screen bg-white dark:bg-slate-950 flex flex-col overflow-hidden relative selection:bg-blue-100 selection:text-blue-900">
      
//       {/* Subtle Background Effects */}
//       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
//         <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-blue-500/5 rounded-full blur-[100px]"></div>
//         <div className="absolute bottom-[-10%] left-[-5%] w-125 h-125 bg-cyan-500/5 rounded-full blur-[100px]"></div>
//       </div>

//       {/* Navbar - Slim & Minimal */}
//       <nav className="p-6 flex justify-between items-center w-full max-w-7xl mx-auto z-10">
//         <div className="flex items-center gap-3">
//           <div className="p-2.5 bg-[hsl(var(--primary))] rounded-xl shadow-lg shadow-blue-500/20">
//             <Wallet className="w-5 h-5 text-white" />
//           </div>
//           <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
//             CashFlow <span className="text-slate-400 font-normal"> Tracker</span>
//           </span>
//         </div>
        
//         {/* Simple Status Indicator */}
//         <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
//             <span className="relative flex h-2 w-2">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//             </span>
//             System Operational
//         </div>
//       </nav>

//       {/* Main Content - Perfectly Centered */}
//       <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        
//         <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-100 dark:border-blue-800 shadow-sm">
//             <LayoutDashboard className="w-4 h-4" />
//             {/* <span>v2.0 Professional Edition</span> */}
//         </div>

//         <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 max-w-3xl leading-tight">
//           Financial Control <br className="hidden md:block"/>
//           <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
//             Simplified.
//           </span>
//         </h1>

//         <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mb-10 leading-relaxed">
//           Secure admin access for managing business portfolios, tracking real-time profits, and optimizing savings.
//         </p>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
//           {user ? (
//              <Link 
//                 href="/dashboard"
//                 className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--primary))] text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20"
//               >
//                 Enter Dashboard <ArrowRight className="w-4 h-4" />
//               </Link>
//           ) : (
//               <>
//                 <Link 
//                     href="/login"
//                     className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
//                 >
//                     Log In
//                 </Link>
//               </>
//           )}
//         </div>

//       </main>

//       {/* Footer - Minimal & Pinned */}
//       <footer className="py-6 text-center z-10">
//         <p className="text-xs text-slate-400 font-medium">
//           © {new Date().getFullYear()} Private Admin Console. Secure Connection.
//         </p>
//       </footer>
//     </div>
//   );
// }

















"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";
import Link from "next/link";
import { Wallet, ArrowRight, Lock, ShieldCheck, BarChart3, PieChart } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative selection:bg-blue-100 selection:text-blue-900 overflow-hidden font-sans">
      
      {/* Background Grid & Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary))]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar - Premium & Minimal */}
      <nav className="p-6 flex justify-between items-center w-full max-w-7xl mx-auto z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[hsl(var(--primary))] to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            CashFlow <span className="text-slate-400 font-medium">Tracker</span>
          </span>
        </div>
        
        {/* Simple Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            System Secure
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 w-full max-w-7xl mx-auto pt-12 pb-20">
        
        {/* Top Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-300/50 dark:border-slate-700/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Lock className="w-4 h-4" />
            <span>Private Admin Console</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 max-w-4xl leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
          Intelligent Finance <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500">
            Command Center
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          A centralized, secure hub to track multiple business portfolios, monitor real-time net profits, and automate your wealth distribution.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          {user ? (
             <Link 
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[hsl(var(--primary))] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
              >
                Enter Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
          ) : (
              <Link 
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-3.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                  Log In Securely
              </Link>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            
            {/* Feature 1 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-left hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Portfolio Tracking</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Manage isolated records for multiple businesses. Instantly calculate net profit vs expenses.
                </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-left hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
                    <PieChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated Vaults</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Set percentage rules to automatically distribute new profits into custom savings categories.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-left hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Private</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    No public profiles. Built strictly as a private financial ledger with secure cloud backups.
                </p>
            </div>

        </div>

      </main>

      {/* Footer - Pinned */}
      <footer className="py-6 text-center z-10 relative">
        <p className="text-xs text-slate-500 dark:text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> 
          Secure Connection &bull; Designed by eb
        </p>
      </footer>
    </div>
  );
}