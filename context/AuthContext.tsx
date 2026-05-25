"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

import { AuthContextType, User } from "@/types";

// আপনার পোস্টগ্রেস ডাটাবেজ স্কিমার (contributor, maintainer) সাথে মিল রেখে টাইপ ফিক্স করা হয়েছে

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ১. লগআউট ফাংশন memoize করা হয়েছে
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  // ২. প্রথমবার অ্যাপ লোড হওয়ার সময় টোকেন চেক করার ইফেক্ট
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded: User = jwtDecode(storedToken);
          setToken(storedToken);
          setUser(decoded);
        } catch (error) {
          console.error("Invalid token found:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ৩. লগইন সাকসেস হ্যান্ডলার
  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    const decoded: User = jwtDecode(newToken);
    setToken(newToken);
    setUser(decoded);
    router.push("/issues");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
