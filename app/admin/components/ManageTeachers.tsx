"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Mail,
    Clock,
    LogIn,
    LogOut,
    Loader2,
    UserCheck,
    CalendarOff,
    Timer,
} from "lucide-react";

interface Teacher {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    todayStatus: string;
    totalTimeDebt: number;
    todayAttendance: {
        id: string;
        checkIn: string | null;
        checkOut: string | null;
        workingHours: number | null;
    } | null;
}

function formatPST(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

import AttendanceOverrideDialog from "./AttendanceOverrideDialog";

export default function ManageTeachers() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [resettingId, setResettingId] = useState<string | null>(null);
    const [overrideData, setOverrideData] = useState<{
        attendanceId?: string;
        teacherId?: string;
        teacherName: string;
        currentCheckIn: string | null;
        currentCheckOut: string | null;
        currentStatus: string;
    } | null>(null);

    const fetchTeachers = async () => {
        try {
            const res = await fetch("/api/admin/teachers");
            const data = await res.json();
            if (data.success) {
                setTeachers(data.teachers);
            }
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Present: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            Late: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            "Half-day": "bg-orange-500/10 text-orange-400 border-orange-500/20",
            Absent: "bg-red-500/10 text-red-400 border-red-500/20",
            "On Leave": "bg-violet-500/10 text-violet-400 border-violet-500/20",
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

    const handleResetDebt = async (teacherId: string) => {
        if (!confirm("Are you sure you want to reset this teacher's time debt to 0?")) return;
        setResettingId(teacherId);
        try {
            const res = await fetch("/api/admin/reset-debt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId })
            });
            const data = await res.json();
            if (data.success) {
                await fetchTeachers();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Network error.");
        } finally {
            setResettingId(null);
        }
    };

    const handleMarkAbsent = async (teacherId: string) => {
        if (!confirm("Mark this teacher as Absent for today? This will add the maximum daily absence penalty.")) return;
        try {
            const res = await fetch("/api/admin/attendance/override", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherId,
                    checkIn: null,
                    checkOut: null,
                    status: "Absent",
                }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchTeachers();
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Network error.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="glass-strong rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <Users size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Manage Teachers
                            </h2>
                            <p className="text-sm text-gray-500">
                                {teachers.length} teachers registered
                            </p>
                        </div>
                    </div>
                </div>

                {teachers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Users size={28} className="text-gray-600" />
                        </div>
                        <p className="text-gray-400 font-medium">
                            No teachers registered
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {teachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03] gap-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-emerald-400">
                                            {teacher.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {teacher.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Mail size={11} />
                                            {teacher.email}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 w-full sm:w-auto">
                                        
                                        {/* Total Time Debt Display & Reset */}
                                        <div className="flex items-center gap-3 bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/10">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Clock size={12} className="text-red-400" />
                                                <span className="text-red-300 font-medium">Debt:</span>
                                                <span className="text-red-400 font-bold">
                                                    {Math.floor(teacher.totalTimeDebt / 60)}h {teacher.totalTimeDebt % 60}m
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleResetDebt(teacher.id)}
                                                disabled={resettingId === teacher.id || teacher.totalTimeDebt === 0}
                                                className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2.5 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                                            >
                                                {resettingId === teacher.id && <Loader2 size={10} className="animate-spin" />}
                                                Reset
                                            </button>
                                        </div>

                                        {/* Today's status */}
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(teacher.todayStatus)}
                                        </div>

                                        {/* Today's times */}
                                        {teacher.todayAttendance ? (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white/5 p-3 sm:px-3 sm:py-1.5 rounded-lg border border-white/10 w-full">
                                                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                                                    <div className="flex items-center gap-1.5 text-gray-200 font-medium tracking-wide">
                                                        <LogIn size={13} className="text-emerald-400" />
                                                        {formatPST(teacher.todayAttendance.checkIn)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-200 font-medium tracking-wide">
                                                        <LogOut size={13} className="text-rose-400" />
                                                        {formatPST(teacher.todayAttendance.checkOut)}
                                                    </div>
                                                    {teacher.todayAttendance.workingHours && (
                                                        <div className="flex items-center gap-1.5 text-sky-200 font-medium">
                                                            <Timer size={13} className="text-sky-400" />
                                                            {teacher.todayAttendance.workingHours}h
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setOverrideData({
                                                        attendanceId: teacher.todayAttendance!.id,
                                                        teacherName: teacher.name,
                                                        currentCheckIn: teacher.todayAttendance!.checkIn,
                                                        currentCheckOut: teacher.todayAttendance!.checkOut,
                                                        currentStatus: teacher.todayStatus
                                                    })}
                                                    className="w-full sm:w-auto px-3 py-2 sm:px-2 sm:py-1 text-[10px] uppercase font-bold text-sky-400 bg-sky-400/10 hover:bg-sky-400/20 rounded cursor-pointer transition text-center shrink-0 mt-2 sm:mt-0"
                                                >
                                                    Override
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleMarkAbsent(teacher.id)}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg cursor-pointer transition border border-red-400/20 flex items-center gap-1.5 shrink-0"
                                                >
                                                    <CalendarOff size={12} />
                                                    Mark Absent
                                                </button>
                                                <button
                                                    onClick={() => setOverrideData({
                                                        teacherId: teacher.id,
                                                        teacherName: teacher.name,
                                                        currentCheckIn: null,
                                                        currentCheckOut: null,
                                                        currentStatus: "Present"
                                                    })}
                                                    className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 rounded-lg cursor-pointer transition border border-emerald-400/20 flex items-center gap-1.5 shrink-0"
                                                >
                                                    <LogIn size={12} />
                                                    Add Record
                                                </button>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary footer */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <UserCheck size={12} className="text-emerald-400/50" />
                        Present:{" "}
                        {
                            teachers.filter(
                                (t) =>
                                    t.todayStatus === "Present" ||
                                    t.todayStatus === "Late"
                            ).length
                        }
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CalendarOff size={12} className="text-violet-400/50" />
                        On Leave:{" "}
                        {
                            teachers.filter(
                                (t) => t.todayStatus === "On Leave"
                            ).length
                        }
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-red-400/50" />
                        Absent:{" "}
                        {
                            teachers.filter((t) => t.todayStatus === "Absent")
                                .length
                        }
                    </div>
                </div>
            </div>
            
            {/* Render Override Dialog */}
            {overrideData && (
                <AttendanceOverrideDialog
                    attendanceId={overrideData.attendanceId}
                    teacherId={overrideData.teacherId}
                    teacherName={overrideData.teacherName}
                    currentCheckIn={overrideData.currentCheckIn}
                    currentCheckOut={overrideData.currentCheckOut}
                    currentStatus={overrideData.currentStatus}
                    onClose={() => setOverrideData(null)}
                    onSuccess={fetchTeachers}
                />
            )}
        </div>
    );
}
