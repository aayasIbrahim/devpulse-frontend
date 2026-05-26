"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import CreateIssueModal from "@/components/CreateIssueModal";
import { GetIssuesResponse, Issue } from "@/types";
import IssueDetailsModal from "@/components/IssueDetailsModal";

export default function IssuesPage() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // মোডাল ওপেন করার হ্যান্ডলার
  const openIssueDetails = (id: number) => {
    setSelectedIssueId(id);
    setIsDetailsOpen(true);
  };
  // 💡 ব্যাকএন্ড queryParams এর সাথে মিল রেখে স্টেট
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // ব্যাকএন্ড থেকে ডাইনামিক কুয়েরি প্যারামিটারসহ ডাটা ফেচ
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoadingIssues(true);

        // ১. ডাইনামিক কোয়েরি স্ট্রিং বিল্ড করা
        const params = new URLSearchParams();
        if (statusFilter) params.append("status", statusFilter);
        if (typeFilter) params.append("type", typeFilter);
        if (sortOrder) params.append("sort", sortOrder);

        const url = `/issues?${params.toString()}`;

        // ২. এপিআই কল
        const response = await api.get<GetIssuesResponse>(url);

        if (response && response.data) {
          setIssues(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoadingIssues(false);
      }
    };

    fetchIssues();
  }, [statusFilter, typeFilter, sortOrder, refreshTrigger]);

  const handleIssueCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleDeleteIssue = async (e: React.MouseEvent, issueId: number) => {
    e.stopPropagation(); // 💡 যেন লাইনে ক্লিক হয়ে Details Modal ওপেন না হয়ে যায়

    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      // আপনার ব্যাকএন্ডের DELETE /issues/:id এপিআই কল
      await api.delete<{ message: string }>(`/issues/${issueId}`);

      // টেবিল রিফ্রেশ করা
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete issue:", error);
      alert("You are not authorized to delete this issue.");
    }
  };
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 font-sans antialiased overflow-hidden">
        {/* --- ১. সাইডবার --- */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <span className="text-xl font-bold tracking-wider text-blue-400">
              🛡️ IssueTracker
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white lg:hidden"
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
          <nav className="p-4 space-y-2">
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium"
            >
              <span>📋</span> <span>All Issues</span>
            </a>
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-sm font-medium truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 capitalize truncate">
                  {user?.role || "Role"}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        {/* --- ২. মেইন কন্টেন্ট এরিয়া --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* প্রফেশনাল হেডার */}
          <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-lg lg:hidden"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600 hidden md:block">
                Welcome back,{" "}
                <span className="text-blue-600 font-semibold">
                  {user?.name}
                </span>{" "}
                👋
              </div>
              <span className="h-6 w-px bg-gray-200 hidden md:block" />
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Create Issue</span>
              </button>
            </div>
          </header>

          {/* মেইন ভিউপোর্ট */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
            {/* 📋 ৩-ফিল্টার বিশিষ্ট এডভান্সড ফিল্টার প্যানেল */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <h2 className="text-base font-bold text-gray-700">
                  Filter & Sort Board
                </h2>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-3 w-full lg:w-auto">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-700 rounded-lg p-2 text-sm focus:ring-blue-500 text-gray-900 outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="open">🟢 Open</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="resolved">🔵 Resolved</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-700 rounded-lg p-2 text-sm focus:ring-blue-500 text-gray-900 outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="bug">🐛 Bug</option>
                    <option value="feature_request">✨ Feature Request</option>
                  </select>

                  {/* Sort Order Filter */}
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="col-span-2 sm:col-span-1 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg p-2 text-sm focus:ring-blue-500 text-gray-900 outline-none"
                  >
                    <option value="newest">📅 Newest First</option>
                    <option value="oldest">📅 Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* --- ৩. ডাইনামিক ডাটা টেবিল --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loadingIssues ? (
                <div className="flex justify-center items-center py-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : issues.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-xl font-medium">No issues found!</p>
                  <p className="text-sm mt-1">
                    Try changing your filters or create a new issue.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Issue Details</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 hidden md:table-cell">
                          Reported By
                        </th>
                        {user?.role === "maintainer" && (
                          <th className="px-6 py-4 text-right">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                      {issues.map((issue) => (
                        <tr
                          key={issue.id}
                          onClick={() => openIssueDetails(issue.id)}
                          className=" cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-gray-400">
                            #{issue.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 break-words max-w-xs sm:max-w-md">
                              {issue.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs sm:max-w-md">
                              {issue.description}
                            </div>
                            <div className="text-[11px] text-gray-400 md:hidden mt-2 flex flex-wrap gap-x-2">
                              <span>
                                👤 {issue.reporter?.name || "Unknown"} (
                                {issue.reporter?.role})
                              </span>
                              <span>
                                •{" "}
                                {new Date(
                                  issue.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${issue.type === "bug" ? "bg-red-50 text-red-700 border border-red-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}
                            >
                              {issue.type === "bug" ? "🐛 bug" : "✨ feature"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize
                              ${issue.status === "open" ? "bg-green-100 text-green-800" : ""}
                              ${issue.status === "in_progress" ? "bg-yellow-100 text-yellow-800" : ""}
                              ${issue.status === "resolved" ? "bg-blue-100 text-blue-800" : ""}
                            `}
                            >
                              {issue.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* 💡 রিপোর্টার কলাম: আপনার ব্যাকএন্ডের ব্যাচ ডাটা থেকে সরাসরি নাম ও রোল রেন্ডার হচ্ছে */}
                          <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {issue.reporter?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                              {issue.reporter?.role || "N/A"}
                            </div>
                          </td>
                          {user?.role === "maintainer" && (
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => handleDeleteIssue(e, issue.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Issue"
                              >
                                {/* ট্র্যাশ/ডিলিট SVG আইকন */}
                                <svg
                                  className="w-5 h-5 inline"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <CreateIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIssueCreated={handleIssueCreated}
      />
      <IssueDetailsModal
        issueId={selectedIssueId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedIssueId(null);
        }}
      />
    </ProtectedRoute>
  );
}
