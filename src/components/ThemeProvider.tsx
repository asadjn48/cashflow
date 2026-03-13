/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun, Loader2 } from "lucide-react";
import { useAuth } from "@/src/components/AuthProvider"; 
import { db } from "@/src/lib/firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
}>({ theme: "light", toggleTheme: () => {}, isLoading: true });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const syncTheme = async () => {
      const localTheme = localStorage.getItem("theme") as Theme;
      if (localTheme) {
        applyTheme(localTheme);
      }

      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "settings", "general");
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().theme) {
            const dbTheme = snap.data().theme as Theme;
            if (dbTheme !== localTheme) {
              applyTheme(dbTheme);
            }
          }
        } catch (error) {
          console.error("Failed to fetch theme preference");
        }
      }
      setIsLoading(false);
    };

    syncTheme();
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    applyTheme(newTheme);

    // 
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "settings", "general"), {
          theme: newTheme
        }, { merge: true });
      } catch (error) {
        console.error("Failed to save theme preference");
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95"
      title="Toggle Theme"
    >
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
    </button>
  );
}