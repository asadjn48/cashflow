// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider"; 
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { 
  LayoutDashboard, 
  PiggyBank, 
  Lightbulb, 
  Settings, 
  Wallet,
  LogOut // New Icon
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Savings", href: "/dashboard/savings", icon: PiggyBank },
  { name: "Ideas", href: "/dashboard/ideas", icon: Lightbulb },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth(); // Get real user

  const handleLogout = async () => {
    // This signs out from Firebase. 
    // The AuthProvider will detect the change and auto-redirect to /login
    await signOut(auth);
  };

  return (
    <>
      {/* --- Desktop Sidebar (Left) --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            CashFlow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              {user?.email?.substring(0, 2).toUpperCase() || "AU"}
            </div>
            <div className="overflow-hidden">
              <p className="text-slate-900 dark:text-white font-medium text-sm truncate w-32">
                {user?.email || "Loading..."}
              </p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- Mobile Bottom Nav --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 pb-safe">
        <div className="flex justify-around items-center p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-1 p-2 rounded-lg",
                  isActive ? "text-emerald-600" : "text-slate-400"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          {/* Mobile Logout (Simple Icon) */}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 rounded-lg text-rose-500">
             <LogOut className="w-6 h-6" />
             <span className="text-[10px] font-medium">Exit</span>
          </button>
        </div>
      </div>
    </>
  );
}