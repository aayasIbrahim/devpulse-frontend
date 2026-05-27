"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Shield, User, Mail, Lock } from "lucide-react";
import { api } from "@/lib/api";

import { SignupInput, SignupResponse } from "@/types";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "contributor",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setError(null);
    setLoading(true);

    try {
      // ব্যাকএন্ড রেসপন্সের সাথে ম্যাচ করিয়ে generic টাইপ দেয়া হয়েছে
      const response = await api.post<SignupInput, SignupResponse>(
        "/auth/signup",
        data,
      );

      // 💡 ব্যাকএন্ড রেসপন্স চেক: যদি রেজিস্ট্রেশন সফল হয়
      if (response && response.success) {
        // ইউজারকে জানান যে অ্যাকাউন্ট তৈরি হয়েছে
        alert("Registration successful! Please login with your credentials.");

        // সরাসরি লগইন পেজে পাঠিয়ে দেওয়া হচ্ছে
        router.push("/login");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create DevPulse Account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Register to start managing engine issues
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

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
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

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
                    message: "Must be at least 6 characters",
                  },
                })}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              System Security Role
            </label>
            <select
              {...register("role")}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-sm outline-none focus:border-indigo-500 transition-colors text-slate-300"
            >
              <option value="contributor">
                Contributor (Submit & Edit Own)
              </option>
              <option value="maintainer">
                Maintainer (Global Root Access)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already verified?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
