// src/app/dashboard/layout.tsx
import Sidebar from "@/src/components/Sidebar";
import AuthProvider from "@/src/components/AuthProvider"; // Import this

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // FIX: Wrap everything in AuthProvider
    <AuthProvider> 
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 md:ml-64 transition-all duration-300 pb-24 md:pb-8">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}