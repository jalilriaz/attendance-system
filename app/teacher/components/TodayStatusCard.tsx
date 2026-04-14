"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Clock,
    LogIn,
    LogOut,
    CheckCircle2,
    XCircle,
    Loader2,
    CalendarDays,
    Timer,
} from "lucide-react";

type Status = "not-checked-in" | "checked-in" | "checked-out";

interface AttendanceData {
    checkIn: string | null;
    checkOut: string | null;
    workingHours: number | null;
    attendanceStatus: string | null;
}

interface Toast {
    message: string;
    type: "success" | "error";
}

export default function TodayStatusCard() {
    const [status, setStatus] = useState<Status>("not-checked-in");
    const [attendance, setAttendance] = useState<AttendanceData | null>(null);
    const [totalTimeDebt, setTotalTimeDebt] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/teacher/today-status");
            const data = await res.json();
            if (data.success) {
                setStatus(data.status);
                setAttendance(data.attendance);
                setTotalTimeDebt(data.totalTimeDebt || 0);
            }
        } catch {
            showToast("Failed to fetch today's status", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            const res = await fetch("/api/teacher/checkin", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, "success");
                await fetchStatus();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Network error. Please try again.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            const res = await fetch("/api/teacher/checkout", {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, "success");
                await fetchStatus();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Network error. Please try again.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (iso: string | null) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleTimeString("en-US", {
            timeZone: "Asia/Karachi",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = () => {
        return new Date().toLocaleDateString("en-US", {
            timeZone: "Asia/Karachi",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const statusConfig = {
        "not-checked-in": {
            label: "Not Checked In",
            color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            dotColor: "bg-amber-500",
        },
        "checked-in": {
            label: "Checked In",
            color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            dotColor: "bg-emerald-500",
        },
        "checked-out": {
            label: "Checked Out",
            color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
            dotColor: "bg-sky-500",
        },
    };

    const currentStatus = statusConfig[status];

    // Skeleton loader
    if (loading) {
        return (
            <div className="glass-strong rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
                <div className="p-4 sm:p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/5 rounded-xl" />
                        <div>
                            <div className="h-5 w-32 bg-white/5 rounded mb-1.5" />
                            <div className="h-3.5 w-48 bg-white/5 rounded" />
                        </div>
                    </div>
                    <div className="h-8 w-28 bg-white/5 rounded-full mb-6" />
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-16 bg-white/5 rounded-xl"
                            />
                        ))}
                    </div>
                    <div className="h-12 bg-white/5 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="glass-strong rounded-2xl overflow-hidden relative">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <CheckCircle2
                                size={20}
                                className="text-emerald-400"
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Today&apos;s Status
                            </h2>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <CalendarDays size={13} />
                                {formatDate()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                <div className="mb-6">
                    <span
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border ${currentStatus.color}`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${currentStatus.dotColor} ${
                                status === "checked-in" ? "animate-pulse" : ""
                            }`}
                        />
                        {currentStatus.label}
                    </span>
                </div>

                {/* Time details */}
                {attendance && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                                <LogIn size={12} />
                                Check In
                            </div>
                            <p className="text-sm font-semibold text-gray-200">
                                {formatTime(attendance.checkIn)}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                                <LogOut size={12} />
                                Check Out
                            </div>
                            <p className="text-sm font-semibold text-gray-200">
                                {formatTime(attendance.checkOut)}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                                <Timer size={12} />
                                Hours
                            </div>
                            <p className="text-sm font-semibold text-gray-200">
                                {attendance.workingHours
                                    ? `${attendance.workingHours}h`
                                    : "—"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Time Debt Widget */}
                {totalTimeDebt > 0 && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-500 mt-0.5">
                            <Clock size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-400">Time Debt Alert</h3>
                            <p className="text-xs text-red-300 mt-1">
                                You owe <span className="font-bold">{Math.floor(totalTimeDebt / 60)} hours {totalTimeDebt % 60} minutes</span>. 
                                Time will be automatically deducted from the end-of-month payroll.
                            </p>
                        </div>
                    </div>
                )}

                {/* Action button */}
                {status === "not-checked-in" && (
                    <button
                        onClick={handleCheckIn}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {actionLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Clock size={18} />
                        )}
                        {actionLoading ? "Checking In..." : "Check In Now"}
                    </button>
                )}

                {status === "checked-in" && (
                    <button
                        onClick={handleCheckOut}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {actionLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <LogOut size={18} />
                        )}
                        {actionLoading ? "Checking Out..." : "Check Out Now"}
                    </button>
                )}

                {status === "checked-out" && (
                    <div className="w-full flex items-center justify-center gap-2 bg-white/5 text-gray-400 font-medium py-3 px-4 rounded-xl border border-white/5">
                        <CheckCircle2
                            size={18}
                            className="text-emerald-400"
                        />
                        You&apos;re done for today!
                    </div>
                )}
            </div>
        </div>
    );
}
