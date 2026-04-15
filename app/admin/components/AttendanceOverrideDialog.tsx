"use client";

import { useState } from "react";
import { X, Clock, Loader2, Save, LogIn, LogOut } from "lucide-react";

interface AttendanceOverrideDialogProps {
    attendanceId?: string;
    teacherId?: string;
    teacherName: string;
    currentCheckIn: string | null;
    currentCheckOut: string | null;
    currentStatus: string;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Convert a UTC ISO string to PST (Asia/Karachi) date & time parts.
 */
function utcToPSTFields(iso: string | null): { date: string; time: string } {
    if (!iso) return { date: "", time: "" };
    const d = new Date(iso);
    const pstDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
    const pstTime = d.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return { date: pstDate, time: pstTime };
}

/**
 * Build an ISO string from PST date + time fields.
 */
function pstFieldsToISO(date: string, time: string): string | null {
    if (!date || !time) return null;
    const pstDateTime = new Date(`${date}T${time}:00+05:00`);
    return pstDateTime.toISOString();
}

export default function AttendanceOverrideDialog({
    attendanceId,
    teacherId,
    teacherName,
    currentCheckIn,
    currentCheckOut,
    currentStatus,
    onClose,
    onSuccess,
}: AttendanceOverrideDialogProps) {
    const checkInPST = utcToPSTFields(currentCheckIn);
    const checkOutPST = utcToPSTFields(currentCheckOut);

    const [checkInDate, setCheckInDate] = useState(checkInPST.date);
    const [checkInTime, setCheckInTime] = useState(checkInPST.time);
    const [checkOutDate, setCheckOutDate] = useState(checkOutPST.date);
    const [checkOutTime, setCheckOutTime] = useState(checkOutPST.time);
    const [status, setStatus] = useState(currentStatus || "Present");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const finalCheckIn = pstFieldsToISO(checkInDate, checkInTime);
            const finalCheckOut = pstFieldsToISO(checkOutDate, checkOutTime);

            const res = await fetch("/api/admin/attendance/override", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    attendanceId,
                    teacherId,
                    checkIn: finalCheckIn,
                    checkOut: finalCheckOut,
                    status,
                }),
            });

            const data = await res.json();
            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.error);
            }
        } catch {
            setError("Network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-[#0e0e1a] border-t sm:border border-white/10 shadow-2xl rounded-t-2xl sm:rounded-2xl w-full sm:max-w-[440px] animate-slide-up sm:animate-fade-in-up flex flex-col"
                style={{ maxHeight: "85vh" }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-white/5 shrink-0">
                    <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-lg font-bold text-white leading-tight">
                            Override Attendance
                        </h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                            Editing record for {teacherName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white p-2 -mr-1 rounded-xl hover:bg-white/5 transition cursor-pointer shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Scrollable form body ── */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: "touch" }}>
                    {/* PKT badge */}
                    <div className="flex items-center gap-1.5 mb-3 sm:mb-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-amber-400/80 bg-amber-500/8 px-2.5 py-1.5 rounded-lg border border-amber-500/10 w-fit">
                        <Clock size={9} />
                        Pakistan Standard Time
                    </div>

                    {error && (
                        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} id="override-form" className="space-y-3.5 sm:space-y-5">
                        {/* Check In */}
                        <div>
                            <label className="text-[11px] sm:text-xs font-semibold text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1.5">
                                <LogIn size={11} className="text-emerald-400" />
                                Check In
                            </label>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <input
                                    type="date"
                                    required
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    className="w-full px-2.5 sm:px-3 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 [color-scheme:dark]"
                                />
                                <input
                                    type="time"
                                    required
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    className="w-full px-2.5 sm:px-3 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Check Out */}
                        <div>
                            <label className="text-[11px] sm:text-xs font-semibold text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1.5">
                                <LogOut size={11} className="text-rose-400" />
                                Check Out
                            </label>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    className="w-full px-2.5 sm:px-3 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/30 [color-scheme:dark]"
                                />
                                <input
                                    type="time"
                                    value={checkOutTime}
                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                    className="w-full px-2.5 sm:px-3 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/30 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-[11px] sm:text-xs font-semibold text-gray-400 mb-1.5 sm:mb-2 block">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "right 12px center",
                                }}
                            >
                                <option value="Present" className="bg-gray-900">✅ Present</option>
                                <option value="Late" className="bg-gray-900">⚠️ Late</option>
                                <option value="Half-day" className="bg-gray-900">🕐 Half-day</option>
                                <option value="Absent" className="bg-gray-900">❌ Absent</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* ── Sticky Footer — Always visible ── */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/5 shrink-0 bg-[#0e0e1a] safe-area-bottom">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 sm:py-3.5 rounded-xl text-[13px] sm:text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer active:scale-[0.96]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="override-form"
                            disabled={loading}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-[13px] sm:text-sm py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer active:scale-[0.96]"
                        >
                            {loading ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <Save size={15} />
                            )}
                            {loading ? "Saving..." : "Update"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
