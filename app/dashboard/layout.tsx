<<<<<<< HEAD
=======
// src/app/dashboard/layout.tsx
>>>>>>> 8a182d0a3fb65f2c6ade179c92b807ce4ecf0774
import Sidebar from "@/src/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
<<<<<<< HEAD
      {/* Sidebar Navigation */}
      <Sidebar />
      
      <main className="flex-1 md:ml-64 transition-all duration-300 pb-24 md:pb-8">
=======
      <Sidebar />
      <main className="flex-1 md:ml-64 transition-all duration-300">
>>>>>>> 8a182d0a3fb65f2c6ade179c92b807ce4ecf0774
        {children}
      </main>
    </div>
  );
}