'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { token, loading } = useAuth();
  const router = useRouter();

  // 💡 যদি ইউজার অলরেডি লগইন করা থাকে, তাকে সরাসরি ড্যাশবোর্ডে রিডাইরেক্ট করো
  useEffect(() => {
    if (!loading && token) {
      router.push('/issues');
    }
  }, [token, loading, router]);

  // কন্টেক্সট লোড হওয়ার সময় একটি ক্লিন স্পিনার দেখাবে
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen   bg-slate-950 px-4 text-slate-100  flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* মেইন কন্টেন্ট কার্ড */}
      <div className="max-w-md w-full space-y-8 text-center bg-slate-950 p-8 rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        
        {/* লোগো / আইকন */}
        <div className="mx-auto h-16 w-16 bg-indigo-600/20 text-indigo-400  rounded-2xl flex items-center justify-center text-3xl shadow-inner">
          🛡️
        </div>

        {/* হেডিং */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-400 tracking-tight sm:text-4xl">
            Issue Tracker
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Welcome to Ayas&apos;s Professional Bug & Feature Tracking System.
          </p>
        </div>

        {/* ডেসক্রিপশন */}
        <p className="text-sm text-gray-600 leading-relaxed">
          আপনার প্রজেক্টের সব বাগ (Bugs) এবং ফিচার রিকোয়েস্ট (Feature Requests) এক জায়গায় ট্র্যাক করুন প্রফেশনাল উপায়ে।
        </p>

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 hover:shadow active:scale-98"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 active:scale-98"
          >
            Create Account
          </Link>
        </div>

      </div>

      {/* ফুটার */}
      <footer className="mt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} IssueTracker. Built by Ayas.
      </footer>

    </div>
  );
}