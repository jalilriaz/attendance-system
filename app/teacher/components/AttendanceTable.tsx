"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    Clock,
    LogIn,
    LogOut,
    Timer,
    CalendarOff,
} from "lucide-react";

interface AttendanceRecord {
    id: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    workingHours: number | null;
    deficitMinutes: number | null;
    status: string;
}

interface LeaveRecord {
    id: string;
    date: string;
    reason: string;
    status: string;
}

export default function AttendanceTable() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState("current");

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/teacher/attendance?month=${selectedMonth}`);
                const data = await res.json();
                if (data.success) {
                    setRecords(data.records);
                    setLeaves(data.leaves);
                }
            } catch (error) {
                console.error("Failed to fetch attendance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [selectedMonth]);

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-US", {
            timeZone: "Asia/Karachi",
            weekday: "short",
            month: "short",
            day: "numeric",
        });
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

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Present:
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            Late: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            "Half-day":
                "bg-orange-500/10 text-orange-400 border-orange-500/20",
            Absent: "bg-red-500/10 text-red-400 border-red-500/20",
            Leave: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    styles[status] ||
                    "bg-white/5 text-gray-400 border-white/10"
                }`}
            >
                {status}
            </span>
        );
    };

    const currentMonth = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    // Merge attendance records and leave records
    const mergedRecords = [
        ...records.map((r) => ({
            id: r.id,
            date: r.date,
            checkIn: r.checkIn,
            checkOut: r.checkOut,
            workingHours: r.workingHours,
            deficitMinutes: r.deficitMinutes,
            status: r.status,
            type: "attendance" as const,
        })),
        ...leaves
            .filter(
                (l) =>
                    !records.some(
                        (r) =>
                            new Date(r.date).toDateString() ===
                            new Date(l.date).toDateString()
                    )
            )
            .map((l) => ({
                id: l.id,
                date: l.date,
                checkIn: null,
                checkOut: null,
                workingHours: null,
                deficitMinutes: null,
                status: "Leave",
                type: "leave" as const,
            })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Skeleton loader
    if (loading) {
        return (
            <div className="glass-strong rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400" />
                <div className="p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/5 rounded-xl" />
                        <div>
                            <div className="h-5 w-52 bg-white/5 rounded mb-1.5" />
                            <div className="h-3.5 w-28 bg-white/5 rounded" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-10 bg-white/5 rounded-lg" />
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-12 bg-white/[0.02] rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-strong rounded-2xl overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400" />

            <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                            <BarChart3 size={20} className="text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Attendance History
                            </h2>
                            <p className="text-sm text-gray-500">
                                {selectedMonth === "current" ? currentMonth : selectedMonth}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            <option value="current" className="bg-gray-900">Current Month</option>
                            <option value="2026-03" className="bg-gray-900">March 2026</option>
                            <option value="2026-02" className="bg-gray-900">February 2026</option>
                            <option value="2026-01" className="bg-gray-900">January 2026</option>
                        </select>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <Clock size={12} />
                            {mergedRecords.length} records
                        </div>
                    </div>
                </div>

                {/* Table */}
                {mergedRecords.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <CalendarOff
                                size={28}
                                className="text-gray-600"
                            />
                        </div>
                        <p className="text-gray-400 font-medium">
                            No attendance records found
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Records for this month will appear here
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-6">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarOff size={12} />
                                            Date
                                        </div>
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <LogIn size={12} />
                                            Check In
                                        </div>
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <LogOut size={12} />
                                            Check Out
                                        </div>
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <Timer size={12} />
                                            Hours
                                        </div>
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            Deficit
                                        </div>
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-6">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mergedRecords.map((record, idx) => (
                                    <tr
                                        key={record.id}
                                        className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] ${
                                            idx % 2 === 0
                                                ? ""
                                                : "bg-white/[0.015]"
                                        }`}
                                    >
                                        <td className="py-3 px-6">
                                            <span className="text-sm font-medium text-gray-300">
                                                {formatDate(record.date)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-400">
                                                {formatTime(record.checkIn)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-400">
                                                {formatTime(record.checkOut)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-medium text-gray-300">
                                                {record.workingHours
                                                    ? `${record.workingHours}h`
                                                    : "—"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-sm ${record.deficitMinutes && record.deficitMinutes > 0 ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                                                {record.deficitMinutes ? `${record.deficitMinutes} m` : "—"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            {getStatusBadge(record.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
