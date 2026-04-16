"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    Loader2,
    ChevronDown,
    Users,
    Clock,
    CalendarOff,
    TrendingUp,
    AlertTriangle,
    Download,
    Sun,
    CalendarDays,
    CalendarCheck,
    Calendar,
    ChevronRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────

interface TeacherReport {
    teacher: {
        id: string;
        name: string;
        email: string;
    };
    monthly: {
        expectedWorkingDays: number;
        expectedMonthlyHours: number;
        totalWorkingHours: number;
        hourDeficit: number;
        presentDays: number;
        lateDays: number;
        halfDays: number;
        absentDays: number;
        approvedLeaves: number;
        paidLeaves: number;
        unpaidLeaves: number;
        totalTimeDebt: number;
        totalHolidays: number;
    };
    weeklyBreakdown: {
        week: number;
        expectedHours: number;
        actualHours: number;
        expectedDays: number;
        presentDays: number;
        absentDays: number;
    }[];
}

interface HolidayInfo {
    title: string;
    date: string;
}

interface MonthlyReportsData {
    mode: "monthly";
    period: {
        month: number;
        year: number;
        totalCalendarDays: number;
        totalSundays: number;
        sundayDates: string[];
        expectedWorkingDays: number;
        expectedMonthlyHours: number;
        totalHolidays: number;
        holidays: HolidayInfo[];
        vacationSummary: {
            sundays: number;
            holidays: number;
            totalNonWorkingDays: number;
            netWorkingDays: number;
        };
    };
    reports: TeacherReport[];
}

interface YearlyMonth {
    month: number;
    monthName: string;
    calendarDays: number;
    sundays: number;
    holidays: number;
    holidayList: HolidayInfo[];
    workingDays: number;
    expectedHours: number;
    reports?: TeacherReport[];
}

interface YearlyReportsData {
    mode: "yearly";
    year: number;
    months: YearlyMonth[];
    totals: {
        totalCalendarDays: number;
        totalSundays: number;
        totalHolidays: number;
        totalWorkingDays: number;
        totalExpectedHours: number;
    };
}

// ── Component ─────────────────────────────────────

export default function ViewReports() {
    const [monthlyData, setMonthlyData] = useState<MonthlyReportsData | null>(null);
    const [yearlyData, setYearlyData] = useState<YearlyReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
    const [showVacationSummary, setShowVacationSummary] = useState(false);
    const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    const [selectedYear, setSelectedYear] = useState(() => {
        return new Date().getFullYear();
    });

    // Fetch monthly data
    useEffect(() => {
        if (viewMode !== "monthly") return;
        const fetchReports = async () => {
            setLoading(true);
            try {
                const [year, month] = selectedMonth.split("-");
                const res = await fetch(
                    `/api/admin/reports?month=${month}&year=${year}`
                );
                const result = await res.json();
                if (result.success) {
                    setMonthlyData(result);
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [selectedMonth, viewMode]);

    // Fetch yearly data
    useEffect(() => {
        if (viewMode !== "yearly") return;
        const fetchYearly = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/admin/reports?mode=yearly&year=${selectedYear}`
                );
                const result = await res.json();
                if (result.success) {
                    setYearlyData(result);
                }
            } catch (error) {
                console.error("Failed to fetch yearly reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchYearly();
    }, [selectedYear, viewMode]);

    // ── CSV Export ─────────────────────────────────
    const [exporting, setExporting] = useState(false);

    const exportToCSV = async () => {
        setExporting(true);
        try {
            let url: string;
            let filename: string;

            if (viewMode === "yearly") {
                url = `/api/admin/reports/daily?mode=yearly&year=${selectedYear}`;
                filename = `attendance_report_${selectedYear}.csv`;
            } else {
                const [year, month] = selectedMonth.split("-");
                url = `/api/admin/reports/daily?mode=monthly&month=${month}&year=${year}`;
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("en-US", { month: "long" });
                filename = `attendance_report_${monthName}_${year}.csv`;
            }

            const res = await fetch(url);
            const result = await res.json();

            if (!result.success || !result.records || result.records.length === 0) {
                alert("No records found for the selected period.");
                return;
            }

            const headers = [
                "Teacher Name",
                "Email",
                "Date",
                "Day",
                "Status",
                "Check In (PKT)",
                "Check Out (PKT)",
                "Working Hours",
            ];

            const rows = result.records.map((r: {
                teacherName: string;
                teacherEmail: string;
                date: string;
                day: string;
                status: string;
                checkIn: string | null;
                checkOut: string | null;
                workingHours: number | null;
            }) => [
                    `"${r.teacherName}"`,
                    `"${r.teacherEmail}"`,
                    r.date,
                    r.day,
                    r.status === "—" ? `""` : `"${r.status}"`,
                    r.checkIn ? `"${r.checkIn}"` : `""`,
                    r.checkOut ? `"${r.checkOut}"` : `""`,
                    r.workingHours != null ? r.workingHours.toFixed(2) : `""`,
                ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((row: string[]) => row.join(",")),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export CSV. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const getAttendancePercentage = (report: TeacherReport) => {
        const total = report.monthly.expectedWorkingDays;
        if (total === 0) return 0;
        const attended =
            report.monthly.presentDays +
            report.monthly.lateDays +
            report.monthly.halfDays * 0.5;
        return Math.round((attended / total) * 100);
    };

    const getHoursPercentage = (report: TeacherReport) => {
        if (report.monthly.expectedMonthlyHours === 0) return 0;
        return Math.round(
            (report.monthly.totalWorkingHours /
                report.monthly.expectedMonthlyHours) *
            100
        );
    };

    const formatHolidayDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-US", {
            timeZone: "Asia/Karachi",
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-sky-400" />
            </div>
        );
    }

    // ═══════════════════════════════════════════════
    // YEARLY VIEW
    // ═══════════════════════════════════════════════
    if (viewMode === "yearly" && yearlyData) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="glass-strong rounded-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400" />
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                                    <Calendar size={20} className="text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Yearly Overview — {yearlyData.year}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Month-by-month breakdown of working days & vacations
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={exportToCSV}
                                    disabled={exporting || !yearlyData || yearlyData.months.length === 0}
                                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {exporting ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Download size={14} />
                                    )}
                                    <span className="hidden sm:inline">
                                        {exporting ? "Exporting..." : "Export CSV"}
                                    </span>
                                </button>
                                {/* Toggle back to monthly */}
                                <button
                                    onClick={() => setViewMode("monthly")}
                                    className="px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <BarChart3 size={14} />
                                    <span className="hidden sm:inline">Monthly View</span>
                                </button>
                                {/* Year picker */}
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer [color-scheme:dark]"
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Yearly Totals */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { label: "Calendar Days", value: yearlyData.totals.totalCalendarDays, color: "text-white" },
                                { label: "Sundays Off", value: yearlyData.totals.totalSundays, color: "text-orange-400" },
                                { label: "Holidays", value: yearlyData.totals.totalHolidays, color: "text-amber-400" },
                                { label: "Working Days", value: yearlyData.totals.totalWorkingDays, color: "text-emerald-400" },
                                { label: "Expected Hours", value: `${yearlyData.totals.totalExpectedHours}h`, color: "text-sky-400" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                                    <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Monthly Breakdown Table */}
                <div className="glass-strong rounded-2xl overflow-hidden">
                    <div className="p-4 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-white/5">
                                        <th className="text-left py-3 pr-4 font-medium">Month</th>
                                        <th className="text-center py-3 px-3 font-medium">Holidays</th>
                                        <th className="text-center py-3 px-3 font-medium">Exp. Days</th>
                                        <th className="text-center py-3 px-3 font-medium text-emerald-400">Present</th>
                                        <th className="text-center py-3 px-3 font-medium text-rose-400">Absent</th>
                                        <th className="text-center py-3 px-3 font-medium">Exp. Hrs</th>
                                        <th className="text-center py-3 px-3 font-medium text-sky-400">Actual Hrs</th>
                                        <th className="text-center py-3 px-3 font-medium text-amber-400">Deficit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearlyData.months.map((m) => {
                                        const teacherReport = m.reports?.[0]; // Assume single teacher for unified overview
                                        return (
                                            <tr key={m.month} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 pr-4 text-white font-medium">{m.monthName}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={m.holidays > 0 ? "text-amber-400" : "text-gray-600"}>
                                                        {m.holidays}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center text-gray-300 font-medium">{m.workingDays}</td>
                                                <td className="py-3 px-3 text-center text-emerald-400">{teacherReport?.monthly.presentDays ?? "—"}</td>
                                                <td className="py-3 px-3 text-center text-rose-400">{teacherReport?.monthly.absentDays ?? "—"}</td>
                                                <td className="py-3 px-3 text-center text-gray-300">{m.expectedHours}h</td>
                                                <td className="py-3 px-3 text-center text-sky-400">{teacherReport?.monthly.totalWorkingHours ?? "—"}h</td>
                                                <td className="py-3 px-3 text-center text-amber-400">{teacherReport?.monthly.hourDeficit ?? "—"}h</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-white/10 font-bold">
                                        <td className="py-3 pr-4 text-white">TOTAL</td>
                                        <td className="py-3 px-3 text-center text-amber-500">{yearlyData.totals.totalHolidays}</td>
                                        <td className="py-3 px-3 text-center text-gray-300">{yearlyData.totals.totalWorkingDays}</td>
                                        <td className="py-3 px-3 text-center text-emerald-400">
                                            {yearlyData.months.reduce((sum, m) => sum + (m.reports?.[0]?.monthly.presentDays || 0), 0)}
                                        </td>
                                        <td className="py-3 px-3 text-center text-rose-400">
                                            {yearlyData.months.reduce((sum, m) => sum + (m.reports?.[0]?.monthly.absentDays || 0), 0)}
                                        </td>
                                        <td className="py-3 px-3 text-center text-gray-300">{yearlyData.totals.totalExpectedHours}h</td>
                                        <td className="py-3 px-3 text-center text-sky-400">
                                            {yearlyData.months.reduce((sum, m) => sum + (m.reports?.[0]?.monthly.totalWorkingHours || 0), 0).toFixed(2)}h
                                        </td>
                                        <td className="py-3 px-3 text-center text-amber-400">
                                            {yearlyData.months.reduce((sum, m) => sum + (m.reports?.[0]?.monthly.hourDeficit || 0), 0).toFixed(2)}h
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════
    // MONTHLY VIEW
    // ═══════════════════════════════════════════════
    const data = monthlyData;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header with month picker */}
            <div className="glass-strong rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400" />
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                                <BarChart3
                                    size={20}
                                    className="text-sky-400"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Attendance Reports
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Monthly breakdown per teacher
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 items-center flex-wrap">
                            <button
                                onClick={() => setViewMode("yearly")}
                                className="px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
                            >
                                <Calendar size={14} />
                                <span className="hidden sm:inline">Yearly Overview</span>
                            </button>
                            <button
                                onClick={exportToCSV}
                                disabled={exporting || !data || data.reports.length === 0}
                                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {exporting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Download size={14} />
                                )}
                                <span className="hidden sm:inline">
                                    {exporting ? "Exporting..." : "Export CSV"}
                                </span>
                            </button>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 [color-scheme:dark] cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Period Info — Expanded Cards */}
                    {data && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { label: "Calendar Days", value: data.period.totalCalendarDays, color: "text-white", icon: CalendarDays },
                                { label: "Sundays Off", value: data.period.totalSundays, color: "text-orange-400", icon: Sun },
                                { label: "Holidays", value: data.period.totalHolidays, color: "text-amber-400", icon: CalendarOff },
                                { label: "Working Days", value: data.period.expectedWorkingDays, color: "text-emerald-400", icon: CalendarCheck },
                                { label: "Expected Hours", value: `${data.period.expectedMonthlyHours}h`, color: "text-sky-400", icon: Clock },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                                    <stat.icon size={14} className={`mx-auto mb-1 ${stat.color} opacity-60`} />
                                    <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vacation Summary — Expandable */}
                    {data && (data.period.totalHolidays > 0 || data.period.totalSundays > 0) && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowVacationSummary(!showVacationSummary)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Sun size={14} className="text-orange-400" />
                                    <span className="font-medium">Vacation Summary</span>
                                    <span className="text-xs text-gray-600">
                                        ({data.period.vacationSummary.totalNonWorkingDays} non-working days)
                                    </span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={`text-gray-500 transition-transform duration-200 ${showVacationSummary ? "rotate-90" : ""}`}
                                />
                            </button>

                            {showVacationSummary && (
                                <div className="mt-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 animate-fade-in space-y-4">
                                    {/* Sundays */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sun size={13} className="text-orange-400" />
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Sundays Off ({data.period.totalSundays})
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {data.period.sundayDates.map((d) => (
                                                <span key={d} className="text-[11px] px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400/80 border border-orange-500/10">
                                                    {new Date(d).toLocaleDateString("en-US", {
                                                        timeZone: "Asia/Karachi",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Holidays */}
                                    {data.period.holidays.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarOff size={13} className="text-amber-400" />
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    Holidays ({data.period.totalHolidays})
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {data.period.holidays.map((h) => (
                                                    <div key={h.date} className="flex items-center gap-2 text-sm">
                                                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400/80 border border-amber-500/10">
                                                            {formatHolidayDate(h.date)}
                                                        </span>
                                                        <span className="text-gray-400">{h.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary line */}
                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Net Working Days this month</span>
                                        <span className="text-emerald-400 font-bold text-sm">
                                            {data.period.vacationSummary.netWorkingDays} days
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Teacher Reports */}
            {data?.reports.map((report) => {
                const attendancePct = getAttendancePercentage(report);
                const hoursPct = getHoursPercentage(report);
                const isExpanded = expandedTeacher === report.teacher.id;

                return (
                    <div
                        key={report.teacher.id}
                        className="glass-strong rounded-2xl overflow-hidden"
                    >
                        <button
                            onClick={() =>
                                setExpandedTeacher(
                                    isExpanded ? null : report.teacher.id
                                )
                            }
                            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-sky-400">
                                        {report.teacher.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white">
                                        {report.teacher.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {report.teacher.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Quick stats */}
                                <div className="hidden sm:flex items-center gap-3 text-xs">
                                    <span className="text-emerald-400">
                                        {attendancePct}% attendance
                                    </span>
                                    <span className="text-gray-600">|</span>
                                    <span className="text-sky-400">
                                        {report.monthly.totalWorkingHours}h
                                        worked
                                    </span>
                                    {report.monthly.absentDays > 0 && (
                                        <>
                                            <span className="text-gray-600">
                                                |
                                            </span>
                                            <span className="text-red-400">
                                                {report.monthly.absentDays}{" "}
                                                absent
                                            </span>
                                        </>
                                    )}
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""
                                        }`}
                                />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 animate-fade-in">
                                {/* Monthly Summary */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2.5 mb-5">
                                    {[
                                        {
                                            label: "Present",
                                            value: report.monthly.presentDays,
                                            color: "text-emerald-400",
                                        },
                                        {
                                            label: "Late",
                                            value: report.monthly.lateDays,
                                            color: "text-amber-400",
                                        },
                                        {
                                            label: "Half-day",
                                            value: report.monthly.halfDays,
                                            color: "text-orange-400",
                                        },
                                        {
                                            label: "Absent",
                                            value: report.monthly.absentDays,
                                            color: "text-red-400",
                                        },
                                        {
                                            label: "Leaves",
                                            value: report.monthly
                                                .approvedLeaves,
                                            color: "text-violet-400",
                                        },
                                        {
                                            label: "Hours",
                                            value: `${report.monthly.totalWorkingHours}h`,
                                            color: "text-sky-400",
                                        },
                                        {
                                            label: "Deficit",
                                            value: `${report.monthly.hourDeficit}h`,
                                            color:
                                                report.monthly.hourDeficit > 0
                                                    ? "text-red-400"
                                                    : "text-emerald-400",
                                        },
                                        {
                                            label: "Paid Leaves",
                                            value: report.monthly.paidLeaves,
                                            color: "text-emerald-400",
                                        },
                                        {
                                            label: "Unpaid Leaves",
                                            value: report.monthly.unpaidLeaves,
                                            color: report.monthly.unpaidLeaves > 0 ? "text-red-400" : "text-gray-400",
                                        },
                                        {
                                            label: "Debt (Mins)",
                                            value: report.monthly.totalTimeDebt,
                                            color: report.monthly.totalTimeDebt > 0 ? "text-red-400" : "text-gray-400",
                                        },
                                    ].map((stat, i) => (
                                        <div
                                            key={i}
                                            className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5"
                                        >
                                            <p className="text-[11px] text-gray-500 mb-0.5">
                                                {stat.label}
                                            </p>
                                            <p
                                                className={`text-base font-bold ${stat.color}`}
                                            >
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bars */}
                                <div className="space-y-3 mb-5">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                <Users size={11} />
                                                Attendance Rate
                                            </span>
                                            <span className="text-white font-medium">
                                                {attendancePct}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${Math.min(attendancePct, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                <Clock size={11} />
                                                Hours Completion
                                            </span>
                                            <span className="text-white font-medium">
                                                {hoursPct}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${Math.min(hoursPct, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Weekly Breakdown */}
                                {report.weeklyBreakdown.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                                            Weekly Breakdown
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="text-gray-500 border-b border-white/5">
                                                        <th className="text-left py-2 pr-4">
                                                            Week
                                                        </th>
                                                        <th className="text-center py-2 px-2">
                                                            Days
                                                        </th>
                                                        <th className="text-center py-2 px-2">
                                                            Present
                                                        </th>
                                                        <th className="text-center py-2 px-2">
                                                            Absent
                                                        </th>
                                                        <th className="text-center py-2 px-2">
                                                            Exp. Hours
                                                        </th>
                                                        <th className="text-center py-2 px-2">
                                                            Actual
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.weeklyBreakdown.map(
                                                        (week) => (
                                                            <tr
                                                                key={week.week}
                                                                className="border-b border-white/[0.03]"
                                                            >
                                                                <td className="py-2 pr-4 text-gray-300">
                                                                    Week{" "}
                                                                    {week.week}
                                                                </td>
                                                                <td className="py-2 px-2 text-center text-gray-400">
                                                                    {
                                                                        week.expectedDays
                                                                    }
                                                                </td>
                                                                <td className="py-2 px-2 text-center text-emerald-400">
                                                                    {
                                                                        week.presentDays
                                                                    }
                                                                </td>
                                                                <td className="py-2 px-2 text-center text-red-400">
                                                                    {
                                                                        week.absentDays
                                                                    }
                                                                </td>
                                                                <td className="py-2 px-2 text-center text-gray-400">
                                                                    {
                                                                        week.expectedHours
                                                                    }
                                                                    h
                                                                </td>
                                                                <td className="py-2 px-2 text-center text-sky-400">
                                                                    {
                                                                        week.actualHours
                                                                    }
                                                                    h
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Warning if deficit */}
                                {report.monthly.hourDeficit > 10 && (
                                    <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-400/80">
                                        <AlertTriangle
                                            size={14}
                                            className="shrink-0"
                                        />
                                        <p>
                                            High hour deficit detected:{" "}
                                            <strong>
                                                {report.monthly.hourDeficit}h
                                            </strong>{" "}
                                            behind expected.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {data?.reports.length === 0 && (
                <div className="glass-strong rounded-2xl p-12 text-center">
                    <CalendarOff
                        size={36}
                        className="mx-auto mb-3 text-gray-600"
                    />
                    <p className="text-gray-400">
                        No teacher reports for this period
                    </p>
                </div>
            )}
        </div>
    );
}
