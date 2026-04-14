"use client";

import { useEffect, useState, useCallback } from "react";
import {
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    CalendarDays,
    User,
    Filter,
} from "lucide-react";

interface LeaveRequest {
    id: string;
    userId: string;
    date: string;
    reason: string;
    status: string;
    type: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
}

interface Toast {
    message: string;
    type: "success" | "error";
}

export default function LeaveRequests() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [filter, setFilter] = useState<"all" | "Pending" | "Approved" | "Rejected">("all");

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchLeaves = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/leaves");
            const data = await res.json();
            if (data.success) {
                setLeaves(data.leaves);
            }
        } catch (error) {
            console.error("Failed to fetch leaves:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const handleAction = async (leaveId: string, status: "Approved" | "Rejected") => {
        setProcessingId(leaveId);
        try {
            const res = await fetch("/api/admin/leaves", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leaveId, status }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, "success");
                await fetchLeaves();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Network error.", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-US", {
            timeZone: "Asia/Karachi",
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTimestamp = (iso: string) => {
        return new Date(iso).toLocaleString("en-US", {
            timeZone: "Asia/Karachi",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    styles[status] || "bg-white/5 text-gray-400 border-white/10"
                }`}
            >
                {status}
            </span>
        );
    };

    const filteredLeaves = filter === "all" ? leaves : leaves.filter((l) => l.status === filter);

    const pendingCount = leaves.filter((l) => l.status === "Pending").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-violet-400" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg animate-slide-in ${
                        toast.type === "success"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/15 text-red-400 border border-red-500/20"
                    }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 size={16} />
                    ) : (
                        <XCircle size={16} />
                    )}
                    {toast.message}
                </div>
            )}

            <div className="glass-strong rounded-2xl overflow-hidden animate-fade-in-up">
                <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400" />
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                                <FileText
                                    size={20}
                                    className="text-violet-400"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Leave Requests
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {pendingCount} pending •{" "}
                                    {leaves.length} total
                                </p>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-1.5 glass rounded-xl p-1">
                            <Filter size={13} className="text-gray-500 ml-2" />
                            {(["all", "Pending", "Approved", "Rejected"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                        filter === f
                                            ? "bg-white/10 text-white"
                                            : "text-gray-500 hover:text-gray-300"
                                    }`}
                                >
                                    {f === "all" ? "All" : f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Leave List */}
                    {filteredLeaves.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <FileText
                                    size={28}
                                    className="text-gray-600"
                                />
                            </div>
                            <p className="text-gray-400 font-medium">
                                No{" "}
                                {filter !== "all"
                                    ? filter.toLowerCase()
                                    : ""}{" "}
                                leave requests
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredLeaves.map((leave) => (
                                <div
                                    key={leave.id}
                                    className="p-3 sm:p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03]"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-7 h-7 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full flex items-center justify-center shrink-0">
                                                    <User
                                                        size={13}
                                                        className="text-violet-400"
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-white">
                                                    {leave.user.name}
                                                </span>
                                                {getStatusBadge(leave.status)}
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${leave.type === "Paid" ? "bg-violet-500/20 text-violet-300" : "bg-orange-500/20 text-orange-300"}`}>
                                                    {leave.type}
                                                </span>
                                            </div>

                                            <div className="ml-9 space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <CalendarDays size={12} />
                                                    Leave for:{" "}
                                                    <span className="text-gray-300 font-medium">
                                                        {formatDate(
                                                            leave.date
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 leading-relaxed">
                                                    <span className="text-gray-500">
                                                        Reason:
                                                    </span>{" "}
                                                    {leave.reason}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                                    <Clock size={10} />
                                                    Requested:{" "}
                                                    {formatTimestamp(
                                                        leave.createdAt
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons (only for pending) */}
                                        {leave.status === "Pending" && (
                                            <div className="flex items-center gap-2 ml-9 sm:ml-0">
                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            leave.id,
                                                            "Approved"
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        leave.id
                                                    }
                                                    className="flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 border border-emerald-500/20"
                                                >
                                                    {processingId ===
                                                    leave.id ? (
                                                        <Loader2
                                                            size={12}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <CheckCircle2
                                                            size={12}
                                                        />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            leave.id,
                                                            "Rejected"
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        leave.id
                                                    }
                                                    className="flex items-center gap-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 border border-red-500/20"
                                                >
                                                    <XCircle size={12} />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info notice */}
                    <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-400/70">
                        <CalendarDays size={14} className="shrink-0 mt-0.5" />
                        <p>
                            Teachers are allowed a maximum of <strong>2 Paid Leaves per month</strong> (excluding Sundays). 
                            If a teacher exceeds this, the framework will automatically mark further requests as <strong>Unpaid</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
