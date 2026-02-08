import Sidebar from "@/src/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      <main className="flex-1 md:ml-64 transition-all duration-300 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}