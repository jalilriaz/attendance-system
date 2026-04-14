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
} from "lucide-react";

interface Stats {
    totalTeachers: number;
    presentToday: number;
    onLeaveToday: number;
    pendingRequests: number;
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

export default function AdminDashboardContent({
    onNavigate,
}: AdminDashboardContentProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/dashboard");
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
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

    const statCards = [
        {
            label: "Total Teachers",
            value: stats?.totalTeachers ?? "—",
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Present Today",
            value: stats?.presentToday ?? "—",
            icon: UserCheck,
            color: "text-sky-400",
            bg: "bg-sky-500/10",
        },
        {
            label: "On Leave",
            value: stats?.onLeaveToday ?? "—",
            icon: CalendarOff,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            label: "Pending Requests",
            value: stats?.pendingRequests ?? "—",
            icon: FileText,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
        },
    ];

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

    return (
        <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up-delay">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        className="glass-strong rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                            >
                                <stat.icon
                                    size={20}
                                    className={stat.color}
                                />
                            </div>
                            <TrendingUp size={14} className="text-gray-700" />
                        </div>
                        <p className="text-2xl font-bold text-white mb-0.5">
                            {stat.value}
                        </p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="glass-strong rounded-2xl overflow-hidden animate-fade-in-up-delay2">
                    <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                <LayoutDashboard
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
