import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/src/components/ToastProvider";
// import WhatsAppFloat from "@/src/components/WhatsAppFloat";
import "./globals.css";
import { AuthProvider } from "@/src/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. LOGO CONFIGURATION
export const metadata: Metadata = {
  title: "Cashflow Dashboard",
  description: "Professional Business Finance Management",
  icons: {
    icon: "/logo.jpg", 
    shortcut: "/logo.jpg",
    apple: "/logo.jpg", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. AUTH PROVIDER */}
        <AuthProvider>
          {/* 3. TOAST PROVIDER (Notifications) */}
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}