"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";

interface CreateIssueInput {
  title: string;
  description: string;
  type: string;
}

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueCreated: () => void; // ইস্যু তৈরি হলে টেবিল রিফ্রেশ করার জন্য
}
interface CreateIssueResponse {
  message: string;
  data: {
    id: number;
    title: string;
    description: string;
    type: string;
    status: "open" | "in_progress" | "resolved";
    reporter_id: number;
    created_at: string;
    updated_at: string;
  };
}

export default function CreateIssueModal({
  isOpen,
  onClose,
  onIssueCreated,
}: CreateIssueModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateIssueInput>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateIssueInput) => {
    setLoading(true);
    setError(null);
    try {
      // 💡 আপনার ব্যাকএন্ডের POST /issues এপিআই হিট করবে (টোকেন অটোমেটিক চলে যাবে)
      await api.post<CreateIssueInput, CreateIssueResponse>("/issues", data);

      reset(); // ফর্মের ডাটা ক্লিয়ার করা
      onIssueCreated(); // ড্যাশবোর্ড টেবিল রিলোড করা
      onClose(); // মোডাল বন্ধ করা
    } catch (err) {
      console.error("Failed to create issue:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* মোডাল হেডার */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Create New Issue</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* মোডাল ফর্ম */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Issue Title
            </label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 outline-none"
              placeholder="e.g., Login API failing"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              {...register("type", { required: "Please select a type" })}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 outline-none cursor-pointer"
            >
              <option value="">Select Type</option>
              {/* 💡 ডাটাবেজ স্কিমার CHECK (type IN ('bug', 'feature_request')) এর সাথে মিল রেখে ফিক্সড */}
              <option value="bug">🐛 Bug</option>
              <option value="feature_request">✨ Feature Request</option>
            </select>
            {errors.type && (
              <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 outline-none resize-none"
              placeholder="Describe the issue in detail..."
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* অ্যাকশন বাটনসমূহ */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Submit Issue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
