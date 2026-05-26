'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { IssueDetailsModalProps, SingleIssueResponse } from '@/types';



export default function IssueDetailsModal({ issueId, isOpen, onClose }: IssueDetailsModalProps) {
  const [issue, setIssue] = useState<SingleIssueResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !issueId) return;

    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        // 💡 আপনার ব্যাকএন্ডের GET /issues/:id এপিআই কল করা হচ্ছে
        const response = await api.get<SingleIssueResponse>(`/issues/${issueId}`);
        if (response && response.data) {
          setIssue(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch issue details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [issueId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-100 flex flex-col">
        
        {/* মোডাল হেডার */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-400">Issue</span>
            <span className="text-sm font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">#{issueId}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* মোដাল কন্টেন্ট */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : issue ? (
            <>
              {/* টাইটেল */}
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-snug break-words">
                  {issue.title}
                </h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  {/* Type Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${issue.type === 'bug' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                    {issue.type === 'bug' ? '🐛 Bug' : '✨ Feature'}
                  </span>
                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                    ${issue.status === 'open' ? 'bg-green-100 text-green-800' : ''}
                    ${issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${issue.status === 'resolved' ? 'bg-blue-100 text-blue-800' : ''}
                  `}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* ডেসক্রিপশন বক্স */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
                  {issue.description}
                </p>
              </div>

              {/* মেটাডাটা গ্রিড (রিপোর্টার এবং টাইম) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                {/* রিপোর্টার ইনফো */}
                <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-2xl">👤</div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase">Reported By</h5>
                    <p className="font-semibold text-gray-900 mt-0.5">{issue.reporter?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{issue.reporter?.role || 'N/A'}</p>
                  </div>
                </div>

                {/* টাইমস্ট্যাম্প ইনফো */}
                <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-2xl">📅</div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase">Timeline</h5>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium text-gray-900">Created:</span> {new Date(issue.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      <span className="font-medium text-gray-900">Updated:</span> {new Date(issue.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">Issue details could not be found.</div>
          )}
        </div>

        {/* মোডাল ফুটার */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors shadow-sm"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}