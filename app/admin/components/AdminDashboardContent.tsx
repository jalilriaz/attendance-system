"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Users,
    BarChart3,
    CalendarDays,
    FileText,
    LayoutDashboard,
    Clock,
    TrendingUp,
    UserCheck,
    CalendarOff,
    Loader2,
    LogIn,
    LogOut as LogOutIcon,
    BookOpen,
} from "lucide-react";

interface TeacherStatus {
    name: string;
    totalTimeDebt: number;
    attendance: {
        checkIn: string | null;
        checkOut: string | null;
        status: string;
    } | null;
    leave: string | null;
}

interface Activity {
    id: string;
    type: "attendance" | "leave";
    message: string;
    timestamp: string;
}

interface AdminDashboardContentProps {
    onNavigate: (tab: string) => void;
}

function formatPST(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatTimePST(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default function AdminDashboardContent({
    onNavigate,
}: AdminDashboardContentProps) {
    const [teacherStatus, setTeacherStatus] = useState<TeacherStatus | null>(null);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/dashboard");
            const data = await res.json();
            if (data.success) {
                setTeacherStatus(data.teacherStatus);
                setPendingRequests(data.pendingRequests);
                setActivity(data.activity);
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2
                    size={28}
                    className="animate-spin text-amber-400"
                />
            </div>
        );
    }

    // Determine current visual status for the teacher
    let displayStatus = "Not Checked In";
    let statusColor = "text-gray-400";
    let statusBg = "bg-gray-500/10";
    let timeLabel = "";

    if (teacherStatus?.leave) {
        displayStatus = `On Leave (${teacherStatus.leave})`;
        statusColor = "text-violet-400";
        statusBg = "bg-violet-500/10";
    } else if (teacherStatus?.attendance) {
        const a = teacherStatus.attendance;
        if (a.status === "Absent") {
            displayStatus = "Absent";
            statusColor = "text-rose-400";
            statusBg = "bg-rose-500/10";
        } else if (a.checkOut) {
            displayStatus = `Checked Out (${a.status})`;
            statusColor = "text-sky-400";
            statusBg = "bg-sky-500/10";
            timeLabel = `at ${formatTimePST(a.checkOut)}`;
        } else if (a.checkIn) {
            displayStatus = `Checked In (${a.status})`;
            statusColor = "text-emerald-400";
            statusBg = "bg-emerald-500/10";
            timeLabel = `at ${formatTimePST(a.checkIn)}`;
        }
    }

    return (
        <div>
            {/* Teacher Hero Card */}
            {teacherStatus && (
                <div className="glass-strong rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in-up-delay relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <UserCheck size={120} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-medium text-amber-400 mb-2 uppercase tracking-widest">
                                Today's Status
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                {teacherStatus.name}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusBg} border border-white/5`}>
                                    {displayStatus === "Absent" ? (
                                        <CalendarOff size={18} className={statusColor} />
                                    ) : (
                                        <Clock size={18} className={statusColor} />
                                    )}
                                    <span className={`text-sm font-bold ${statusColor}`}>
                                        {displayStatus} {timeLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-4 min-w-[200px]">
                                <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center rounded-lg shrink-0">
                                    <TrendingUp size={20} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Running Time Debt</p>
                                    <p className="text-xl font-bold text-white">
                                        {teacherStatus.totalTimeDebt} <span className="text-sm font-normal text-gray-500">mins</span>
                                    </p>
                                </div>
                            </div>

                            {pendingRequests > 0 && (
                                <button 
                                    onClick={() => onNavigate("leaves")}
                                    className="p-4 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-colors flex items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-violet-400" />
                                        <span className="text-sm font-medium text-violet-300">
                                            Pending Requests
                                        </span>
                                    </div>
                                    <div className="bg-violet-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {pendingRequests}
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="glass-strong rounded-2xl overflow-hidden animate-fade-in-up-delay2">
                    <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                <BookOpen
                                    size={20}
                                    className="text-amber-400"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Quick Actions
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Common administrative tasks
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                {
                                    icon: Users,
                                    label: "Manage Teachers",
                                    color: "text-emerald-400",
                                    bg: "bg-emerald-500/10 hover:bg-emerald-500/15",
                                    tab: "teachers",
                                },
                                {
                                    icon: BarChart3,
                                    label: "View Reports",
                                    color: "text-sky-400",
                                    bg: "bg-sky-500/10 hover:bg-sky-500/15",
                                    tab: "reports",
                                },
                                {
                                    icon: CalendarDays,
                                    label: "Manage Holidays",
                                    color: "text-amber-400",
                                    bg: "bg-amber-500/10 hover:bg-amber-500/15",
                                    tab: "holidays",
                                },
                                {
                                    icon: FileText,
                                    label: "Leave Requests",
                                    color: "text-violet-400",
                                    bg: "bg-violet-500/10 hover:bg-violet-500/15",
                                    tab: "leaves",
                                },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => onNavigate(action.tab)}
                                    className={`flex items-center gap-3 p-4 rounded-xl ${action.bg} transition-all duration-300 cursor-pointer border border-white/5`}
                                >
                                    <action.icon
                                        size={18}
                                        className={action.color}
                                    />
                                    <span className="text-sm font-medium text-gray-300">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-strong rounded-2xl overflow-hidden animate-fade-in-up-delay2">
                    <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400" />
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                                <Clock
                                    size={20}
                                    className="text-sky-400"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Recent Activity
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Latest system events
                                </p>
                            </div>
                        </div>

                        {activity.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/5">
                                    <Clock
                                        size={20}
                                        className="text-gray-600"
                                    />
                                </div>
                                <p className="text-sm text-gray-500">
                                    No activity yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                                {activity.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03]"
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                                item.type === "attendance"
                                                    ? "bg-emerald-500/10"
                                                    : "bg-violet-500/10"
                                            }`}
                                        >
                                            {item.type === "attendance" ? (
                                                <LogIn
                                                    size={13}
                                                    className="text-emerald-400"
                                                />
                                            ) : (
                                                <LogOutIcon
                                                    size={13}
                                                    className="text-violet-400"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-300 leading-snug">
                                                {item.message}
                                            </p>
                                            <p className="text-[11px] text-gray-600 mt-0.5">
                                                {formatPST(item.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
