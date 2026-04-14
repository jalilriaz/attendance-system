"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    FileText,
    Send,
    Loader2,
    CheckCircle2,
    XCircle,
} from "lucide-react";

interface Toast {
    message: string;
    type: "success" | "error";
}

export default function LeaveRequestForm() {
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const [paidLeavesUsed, setPaidLeavesUsed] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ date?: string; reason?: string }>({});

    const fetchLeaveStats = async () => {
        try {
            const res = await fetch("/api/teacher/leave");
            const data = await res.json();
            if (data.success) {
                setPaidLeavesUsed(data.paidLeavesUsed);
            }
        } catch (error) {
            console.error("Failed to fetch leave stats", error);
        }
    };

    // fetch on initial load
    useEffect(() => {
        fetchLeaveStats();
    }, []);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const validate = (): boolean => {
        const newErrors: { date?: string; reason?: string } = {};

        if (!date) {
            newErrors.date = "Please select a date";
        }

        if (!reason || reason.trim().length < 5) {
            newErrors.reason = "Reason must be at least 5 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/teacher/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, reason: reason.trim() }),
            });

            const data = await res.json();

            if (data.success) {
                showToast(data.message, "success");
                setDate("");
                setReason("");
                setErrors({});
                await fetchLeaveStats();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Network error. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Get minimum date (tomorrow) in PST
    const getMinDate = () => {
        const now = new Date();
        const pstDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Karachi" });
        const pstDate = new Date(pstDateStr);
        pstDate.setDate(pstDate.getDate() + 1);
        
        // Format as YYYY-MM-DD
        const year = pstDate.getFullYear();
        const month = String(pstDate.getMonth() + 1).padStart(2, '0');
        const day = String(pstDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="glass-strong rounded-2xl overflow-hidden relative">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400" />

            {/* Toast notification */}
            {toast && (
                <div
                    className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 animate-slide-in ${
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

            <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                        <Calendar size={20} className="text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Request Leave
                        </h2>
                        <p className="text-sm text-gray-500">
                            Submit a leave application for approval
                        </p>
                    </div>
                </div>

                {/* Leaves Counter Widget */}
                <div className="mb-6 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                            <FileText size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-300">Paid Leaves Used</p>
                            <p className="text-xs text-gray-500">This Month</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className={`text-xl font-bold ${(paidLeavesUsed ?? 0) >= 2 ? "text-red-400" : "text-emerald-400"}`}>
                            {paidLeavesUsed !== null ? paidLeavesUsed : "-"}
                        </span>
                        <span className="text-gray-500 font-medium"> / 2</span>
                    </div>
                </div>

                {paidLeavesUsed !== null && paidLeavesUsed >= 2 && (
                    <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-xs text-amber-400 text-center font-medium flex items-center justify-center gap-1.5">
                            <XCircle size={14} /> You have reached your paid leave limit. Further requests will be marked as Unpaid.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date field */}
                    <div>
                        <label
                            htmlFor="leave-date"
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5"
                        >
                            <Calendar size={14} className="text-gray-500" />
                            Leave Date
                        </label>
                        <input
                            id="leave-date"
                            type="date"
                            value={date}
                            min={getMinDate()}
                            onChange={(e) => {
                                setDate(e.target.value);
                                if (errors.date)
                                    setErrors((p) => ({
                                        ...p,
                                        date: undefined,
                                    }));
                            }}
                            className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm transition-all focus:outline-none focus:ring-2 [color-scheme:dark] ${
                                errors.date
                                    ? "border-red-500/30 focus:ring-red-500/20"
                                    : "border-white/10 focus:ring-violet-500/20 focus:border-violet-500/30"
                            }`}
                        />
                        {errors.date && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                <XCircle size={12} /> {errors.date}
                            </p>
                        )}
                    </div>

                    {/* Reason field */}
                    <div>
                        <label
                            htmlFor="leave-reason"
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5"
                        >
                            <FileText size={14} className="text-gray-500" />
                            Reason
                        </label>
                        <textarea
                            id="leave-reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (errors.reason)
                                    setErrors((p) => ({
                                        ...p,
                                        reason: undefined,
                                    }));
                            }}
                            rows={3}
                            placeholder="Please describe the reason for your leave..."
                            className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-gray-600 resize-none ${
                                errors.reason
                                    ? "border-red-500/30 focus:ring-red-500/20"
                                    : "border-white/10 focus:ring-violet-500/20 focus:border-violet-500/30"
                            }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {errors.reason ? (
                                <p className="text-xs text-red-400 flex items-center gap-1">
                                    <XCircle size={12} /> {errors.reason}
                                </p>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-gray-600">
                                {reason.length} characters
                            </span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                        {loading ? "Submitting..." : "Submit Leave Request"}
                    </button>
                </form>
            </div>
        </div>
    );
}
