'use client';

import { useAuth } from '@/context/AuthContext'; // আপনার AuthContext এর পাথ অনুযায়ী ইম্পোর্ট করুন
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth(); // আপনার কন্টেক্সটে loading স্টেট থাকলে ভালো, না থাকলে শুধু token নিন
  const router = useRouter();

  useEffect(() => {
    // লোডিং শেষ হওয়ার পর যদি টোকেন না থাকে, তবে লগইন পেজে রিডাইরেক্ট করবে
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  // যদি লোডিং চলে বা টোকেন না থাকে, তবে স্ক্রিনে একটি স্পিনার বা ব্ল্যাঙ্ক দেখাবে
  if (loading || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // টোকেন থাকলে মেইন পেজটি রেন্ডার হবে
  return <>{children}</>;
}