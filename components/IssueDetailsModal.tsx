"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ApiErrorResponse,
  ExtendedModalProps,
  SingleIssueResponse,
} from "@/types";

export default function IssueDetailsModal({
  issueId,
  isOpen,
  onClose,
  onIssueUpdated,
}: ExtendedModalProps) {
  const { user } = useAuth();

  // SingleIssueResponse['data'] থেকে টাইপ এক্সট্র্যাক্ট করা হয়েছে
  type IssueDataType = SingleIssueResponse["data"];

  const [issue, setIssue] = useState<IssueDataType | null>(null);
  const [loading, setLoading] = useState(false);

  // ফর্মের জন্য স্টেটস
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<"bug" | "feature_request">("bug");
  const [editStatus, setEditStatus] = useState<
    "open" | "in_progress" | "resolved"
  >("open");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssueDetails = async (): Promise<IssueDataType | null> => {
    if (!issueId) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get<SingleIssueResponse>(`/issues/${issueId}`);

      if (response && response.data) {
        // 💡 টাইপ-সেফ অবজেক্ট ডেসট্রাকচারিং:
        // response.data-এর ভেতরে নিজেই একটি 'data' প্রপার্টি আছে কি না তা টাইপ-সেফ উপায়ে চেক করা হচ্ছে
        const targetData =
          typeof response.data === "object" && "data" in response.data
            ? (response.data as { data: IssueDataType }).data
            : (response.data as IssueDataType);

        if (targetData && (targetData.title || targetData.id)) {
          setIssue(targetData);
          setEditTitle(targetData.title || "");
          setEditDescription(targetData.description || "");
          setEditType(targetData.type || "bug");
          setEditStatus(targetData.status || "open");
          return targetData;
        } else {
          setError("Issue record syntax is missing or invalid.");
          return null;
        }
      } else {
        setError("No response received from server.");
      }
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(
        apiError?.response?.data?.message ||
          apiError.message ||
          "Failed to load issue details.",
      );
      return null;
    } finally {
      setLoading(false);
    }
    return null;
  };

  // মোডাল প্রথম ওপেন হলে এডিট স্টেট এবং ডাটা রিসেট করার ইফেক্ট
  useEffect(() => {
    if (!isOpen || !issueId) return;

    // Reset edit mode and fetch details asynchronously to avoid cascading render warning
    const _t = setTimeout(() => {
      setIsEditMode(false);
      void fetchIssueDetails();
    }, 0);
    return () => clearTimeout(_t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId, isOpen]);

  if (!isOpen) return null;

  // পারমিশন চেক লজিক (সম্পূর্ণ টাইপ সেফ)
  const isAuthorizedToEdit = (): boolean => {
    if (!issue || !user) return false;
    if (user.role === "maintainer") return true;

    if (user.role === "contributor") {
      const isOwnIssue =
        issue.reporter?.id && String(issue.reporter.id) === String(user.id);
      const isOpenStatus = issue.status === "open";
      return !!(isOwnIssue && isOpenStatus);
    }
    return false;
  };

  // আপডেট হ্যান্ডলার
  const handleUpdate = async () => {
    setError(null);
    if (editTitle.length > 150)
      return setError("Title cannot exceed 150 characters");
    if (editDescription.length < 20)
      return setError("Description must be at least 20 characters");

    try {
      setUpdateLoading(true);
      const payload = {
        title: editTitle,
        description: editDescription,
        type: editType,
        status: editStatus,
      };

      const resp = await api.patch<typeof payload, SingleIssueResponse>(
        `/issues/${issueId}`,
        payload,
      );

      // Try to optimistically apply returned data from the patch response
      const respData = resp?.data;
      if (respData) {
        const patchedData = (respData as IssueDataType) || null;

        if (patchedData) {
          setIssue(patchedData);
          setEditTitle(patchedData.title || "");
          setEditDescription(patchedData.description || "");
          setEditType(patchedData.type || "bug");
          setEditStatus(patchedData.status || "open");
        }
      }

      // Ensure we fetch fresh data from server and wait for completion
      await fetchIssueDetails();

      setIsEditMode(false);
      if (onIssueUpdated) onIssueUpdated();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      console.error("Update error:", apiError);
      setError(
        apiError?.response?.data?.message ||
          apiError.message ||
          "Update failed",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditMode(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-100 flex flex-col">
        {/* মোডাল হেডার */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-400">Issue</span>
            <span className="text-sm font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
              #{issueId}
            </span>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
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

        {/* মোডাল কন্টেন্ট */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : issue ? (
            <>
              {isEditMode ? (
                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Type
                      </label>
                      <select
                        value={editType}
                        onChange={(e) =>
                          setEditType(
                            e.target.value as "bug" | "feature_request",
                          )
                        }
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="bug">🐛 Bug</option>
                        <option value="feature_request">
                          ✨ Feature Request
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(
                            e.target.value as
                              | "open"
                              | "in_progress"
                              | "resolved",
                          )
                        }
                        disabled={user?.role === "contributor"}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                      >
                        <option value="open">🟢 Open</option>
                        <option value="in_progress">🟡 In Progress</option>
                        <option value="resolved">🔵 Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-snug break-words">
                      {issue.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${issue.type === "bug" ? "bg-red-50 text-red-700 border border-red-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}
                      >
                        {issue.type === "bug" ? "🐛 Bug" : "✨ Feature"}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                        ${issue.status === "open" ? "bg-green-100 text-green-800" : ""}
                        ${issue.status === "in_progress" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${issue.status === "resolved" ? "bg-blue-100 text-blue-800" : ""}
                      `}
                      >
                        {issue.status ? issue.status.replace("_", " ") : ""}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
                      {issue.description}
                    </p>
                  </div>
                </>
              )}

              {/* মেটাডাটা গ্রিড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-2xl">👤</div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase">
                      Reported By
                    </h5>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {issue.reporter?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {issue.reporter?.role || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-2xl">📅</div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase">
                      Timeline
                    </h5>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium text-gray-900">
                        Created:
                      </span>{" "}
                      {issue.created_at
                        ? new Date(issue.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      <span className="font-medium text-gray-900">
                        Updated:
                      </span>{" "}
                      {issue.updated_at
                        ? new Date(issue.updated_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Issue details could not be found.
            </div>
          )}
        </div>

        {/* মোডাল ফুটার */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            {!isEditMode && isAuthorizedToEdit() && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                ✏️ Edit Issue
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            {isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center min-w-[80px]"
                >
                  {updateLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Save"
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
