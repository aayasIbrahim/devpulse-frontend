"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Shield, Mail, Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoginInput, LoginResponse } from "@/types";

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // react-hook-form সেটআপ
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ফর্ম সাবমিট হ্যান্ডলার (API Call)
const onSubmit = async (data: LoginInput) => {
  setError(null);
  setLoading(true);

  try {
    // এপিআই-তে রিকোয়েস্ট পাঠানো হচ্ছে
    const response = await api.post<LoginInput, LoginResponse>("/auth/login", {
      email: data.email,
      password: data.password || "",
    });

    // 💡 ব্যাকএন্ড রেসপন্স স্ট্রাকচার (response.data.token) অনুযায়ী টোকেন রিড করা হচ্ছে
    if (response && response.data && response.data.token) {
      login(response.data.token); 
    } else {
      setError("Server did not return an authentication token.");
    }
  } catch (err) {
    console.error("Login component error:", err);
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Invalid email or password. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        {/* লোগো ও হেডার */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tigh_t">
            Welcome to DevPulse
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to access secure diagnostic routing
          </p>
        </div>

        {/* এরর মেসেজ অ্যালার্ট */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ফর্ম শুরু */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ইমেইল ইনপুট */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="dev@pulse.com"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* পাসওয়ার্ড ইনপুট */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* সাবমিট বাটন */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* সাইনআপ পেজ লিংক */}
        <p className="text-center text-sm text-slate-400">
          New to the engineering hub?{" "}
          <Link href="/signup" className="text-indigo-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
