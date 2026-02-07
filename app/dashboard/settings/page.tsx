/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
"use client";

import { useState } from "react";

import { useBusinesses } from "@/src/hooks/useBusinesses"; 
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "@/src/components/ToastProvider"; 
import Button from "@/src/components/ui/Button"; 
import DashboardHeader from "@/src/components/DashboardHeader"; 
import { Loader2, Download, FileText } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  

  const { businesses, isLoading } = useBusinesses();
  
  const [isExporting, setIsExporting] = useState(false);

  const handleGlobalExport = async () => {
    if(!user) return;
    setIsExporting(true);
    try {
        let allRows: string[] = ["Business,Date,Description,Type,Amount"];
        
        for (const biz of businesses) {
            const transSnap = await getDocs(collection(db, "users", user.uid, "businesses", biz.id, "transactions"));
            transSnap.forEach(doc => {
                const t = doc.data();
                allRows.push(`${biz.name},${new Date(t.date?.toDate()).toLocaleDateString()},"${t.description}",${t.type},${t.amount}`);
            });
        }
        const csvContent = allRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Global_Report_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Export downloaded", "success");
    } catch (e) {
        showToast("Export failed", "error");
    } finally {
        setIsExporting(false);
    }
  };

 
  if (isLoading && businesses.length === 0) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <DashboardHeader title="System Settings" />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <FileText className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Global Data Export</h2>
            <p className="text-slate-500 max-w-md leading-relaxed mb-8">
                Generate a comprehensive CSV report containing every transaction from all your active businesses.
            </p>
            <div className="w-full max-w-sm">
                <Button onClick={handleGlobalExport} isLoading={isExporting} className="w-full h-12 text-base shadow-xl">
                    <Download className="w-5 h-5 mr-2" /> Download Full Report
                </Button>
                <p className="text-xs text-slate-400 mt-4">
                    Ready to export data from {businesses.length} portfolios.
                </p>
            </div>
      </div>
    </div>
  );
}