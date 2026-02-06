// // src/components/AuthProvider.tsx
// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { auth } from "@/src/lib/firebase";
// import { useRouter } from "next/navigation";
// import { Loader2 } from "lucide-react";

// // 1. Create Context
// const AuthContext = createContext<{ user: User | null }>({ user: null });

// export const useAuth = () => useContext(AuthContext);

// // 2. The Provider Component
// export default function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     // Listen for login/logout changes
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
      
//       // If we are NOT logged in, kick user to login page
//       if (!currentUser) {
//         router.push("/login");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
//         <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }















// src/components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
// import { Loader2 } from "lucide-react";

// 1. Update the Shape of the Context
type AuthContextType = {
  user: User | null;
  loading: boolean; // <--- This was missing
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once Firebase responds
    });

    return () => unsubscribe();
  }, []);

  // 2. Pass 'loading' to the Provider
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* Optional: Show a full-screen loader while checking auth */}
      {/* This prevents the "Login" button from flashing before redirecting */}
      {children}
    </AuthContext.Provider>
  );
}