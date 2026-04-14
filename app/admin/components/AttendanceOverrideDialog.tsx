"use client";

import { useState } from "react";
import { X, Clock, Loader2 } from "lucide-react";

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
    const [checkInDate, setCheckInDate] = useState(
        currentCheckIn ? new Date(currentCheckIn).toISOString().slice(0, 10) : ""
    );
    const [checkInTime, setCheckInTime] = useState(
        currentCheckIn ? new Date(currentCheckIn).toISOString().slice(11, 16) : ""
    );
    const [checkOutDate, setCheckOutDate] = useState(
        currentCheckOut ? new Date(currentCheckOut).toISOString().slice(0, 10) : ""
    );
    const [checkOutTime, setCheckOutTime] = useState(
        currentCheckOut ? new Date(currentCheckOut).toISOString().slice(11, 16) : ""
    );
    const [status, setStatus] = useState(currentStatus || "Present");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const finalCheckIn = (checkInDate && checkInTime) ? new Date(`${checkInDate}T${checkInTime}`).toISOString() : null;
            const finalCheckOut = (checkOutDate && checkOutTime) ? new Date(`${checkOutDate}T${checkOutTime}`).toISOString() : null;

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
        } catch (err) {
            setError("Network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#12121e] border border-white/10 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Override Attendance</h3>
                        <p className="text-xs text-gray-500">Editing record for {teacherName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                                <Clock size={12} /> Check In (Local)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    required
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    className="w-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 [color-scheme:dark]"
                                />
                                <input
                                    type="time"
                                    required
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    className="w-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                                <Clock size={12} /> Check Out (Local)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    className="w-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 [color-scheme:dark]"
                                />
                                <input
                                    type="time"
                                    value={checkOutTime}
                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                    className="w-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Status Override</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                            >
                                <option value="Present" className="bg-gray-900">Present</option>
                                <option value="Late" className="bg-gray-900">Late</option>
                                <option value="Half-day" className="bg-gray-900">Half-day</option>
                                <option value="Absent" className="bg-gray-900">Absent</option>
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Override"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
