"use client";

import { useEffect, useState, useCallback } from "react";
import {
    CalendarDays,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    XCircle,
    Calendar,
    Sparkles,
    Edit2,
    Save
} from "lucide-react";

interface Holiday {
    id: string;
    title: string;
    date: string;
}

interface Toast {
    message: string;
    type: "success" | "error";
}

export default function ManageHolidays() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Editing states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDate, setEditDate] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchHolidays = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/holidays");
            const data = await res.json();
            if (data.success) {
                setHolidays(data.holidays);
            }
        } catch (error) {
            console.error("Failed to fetch holidays:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;

        setAdding(true);
        try {
            const res = await fetch("/api/admin/holidays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), date }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Holiday added successfully!", "success");
                setTitle("");
                setDate("");
                setShowForm(false);
                await fetchHolidays();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Network error.", "error");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/holidays/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                showToast("Holiday removed.", "success");
                await fetchHolidays();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Network error.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditClick = (holiday: Holiday) => {
        setEditingId(holiday.id);
        setEditTitle(holiday.title);
        // Ensure date is in YYYY-MM-DD format for date input
        const isoDate = new Date(holiday.date).toISOString().split("T")[0];
        setEditDate(isoDate);
    };

    const handleUpdateHoliday = async (id: string) => {
        if (!editTitle.trim() || !editDate) return;
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/admin/holidays/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle.trim(), date: editDate }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Holiday updated successfully.", "success");
                setEditingId(null);
                await fetchHolidays();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Network error.", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-US", {
            timeZone: "Asia/Karachi",
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getMonthGroup = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-US", {
            timeZone: "Asia/Karachi",
            month: "long",
            year: "numeric",
        });
    };

    // Group holidays by month
    const grouped: Record<string, Holiday[]> = {};
    holidays.forEach((h) => {
        const key = getMonthGroup(h.date);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(h);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-amber-400" />
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
                <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                <CalendarDays
                                    size={20}
                                    className="text-amber-400"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Manage Holidays
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {holidays.length} holidays registered
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer border border-amber-500/20"
                        >
                            <Plus size={16} />
                            Add Holiday
                        </button>
                    </div>

                    {/* Add Holiday Form */}
                    {showForm && (
                        <form
                            onSubmit={handleAddHoliday}
                            className="mb-6 p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/5 animate-fade-in-up"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles
                                    size={16}
                                    className="text-amber-400"
                                />
                                <h3 className="text-sm font-semibold text-white">
                                    New Holiday
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">
                                        Holiday Name
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="e.g. Eid-ul-Fitr"
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) =>
                                            setDate(e.target.value)
                                        }
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all [color-scheme:dark]"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
                                >
                                    {adding ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Plus size={14} />
                                    )}
                                    {adding ? "Adding..." : "Add Holiday"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Holiday List */}
                    {holidays.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Calendar
                                    size={28}
                                    className="text-gray-600"
                                />
                            </div>
                            <p className="text-gray-400 font-medium">
                                No holidays registered
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Add holidays to block attendance on those days
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(grouped).map(
                                ([month, monthHolidays]) => (
                                    <div key={month}>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 px-1">
                                            {month}
                                        </h3>
                                        <div className="space-y-2">
                                            {monthHolidays.map((holiday) => (
                                                <div
                                                    key={holiday.id}
                                                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03] group"
                                                >
                                                    {editingId === holiday.id ? (
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                                                autoFocus
                                                            />
                                                            <input
                                                                type="date"
                                                                value={editDate}
                                                                onChange={(e) => setEditDate(e.target.value)}
                                                                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 [color-scheme:dark]"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateHoliday(holiday.id)}
                                                                    disabled={updatingId === holiday.id}
                                                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm transition-colors"
                                                                >
                                                                    {updatingId === holiday.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                                                                >
                                                                    <XCircle size={14} />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                                                    <CalendarDays
                                                                        size={16}
                                                                        className="text-amber-400"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-white">
                                                                        {holiday.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatDate(holiday.date)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEditClick(holiday)}
                                                                    className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-sky-500/20"
                                                                >
                                                                    <Edit2 size={12} />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                                                    disabled={deletingId === holiday.id}
                                                                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 border border-red-500/20"
                                                                >
                                                                    {deletingId === holiday.id ? (
                                                                        <Loader2 size={12} className="animate-spin" />
                                                                    ) : (
                                                                        <Trash2 size={12} />
                                                                    )}
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
