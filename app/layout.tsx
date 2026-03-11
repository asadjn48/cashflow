// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import { AuthProvider } from "@/src/components/AuthProvider";
// import { ToastProvider } from "@/src/components/ToastProvider";
// import { ThemeProvider } from "@/src/components/ThemeProvider"; 
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Cashflow Tracker",
//   description: "Professional Business Finance Management",

//   icons: {
//     icon: "/logo.png", 
//     shortcut: "/logo.png",
//     apple: "/logo.png", 
//   },
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     // 1. ADD suppressHydrationWarning
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
//         {/* 2. NO-FLASH SCRIPT: Runs instantly to set dark mode before React loads */}
//         <script
//           dangerouslySetInnerHTML={{
//             __html: `
//               (function() {
//                 try {
//                   var savedTheme = localStorage.getItem('theme');
//                   var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//                   if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
//                     document.documentElement.classList.add('dark');
//                   } else {
//                     document.documentElement.classList.remove('dark');
//                   }
//                 } catch (e) {}
//               })();
//             `,
//           }}
//         />

//         <AuthProvider>
//           <ThemeProvider>
//              <ToastProvider>
//                {children}
//              </ToastProvider>
//           </ThemeProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


















import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/src/components/AuthProvider";
import { ToastProvider } from "@/src/components/ToastProvider";
import { ThemeProvider } from "@/src/components/ThemeProvider"; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. ADD VIEWPORT EXPORT: This makes the app feel native on mobile and prevents zooming
export const viewport: Viewport = {
  themeColor: "#0663F4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
};

// 2. UPDATE METADATA: Added the PWA manifest and Apple Web App settings
export const metadata: Metadata = {
  title: "Cashflow Tracker",
  description: "Professional Business Finance Management",
  manifest: "/manifest.json", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cashflow",
  },
  icons: {
    icon: "/logo.png", 
    shortcut: "/logo.png",
    apple: "/logo.png", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        {/* NO-FLASH SCRIPT: Runs instantly to set dark mode before React loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        <AuthProvider>
          <ThemeProvider>
             <ToastProvider>
               {children}
             </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}