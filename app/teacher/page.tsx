import type { Metadata } from "next";
import {
    GraduationCap,
    LayoutDashboard,
    LogOut,
} from "lucide-react";
import TodayStatusCard from "./components/TodayStatusCard";
import LeaveRequestForm from "./components/LeaveRequestForm";
import AttendanceTable from "./components/AttendanceTable";
import LogoutButton from "./components/LogoutButton";

export const metadata: Metadata = {
    title: "Teacher Portal | Madrasa Karam Khan",
    description:
        "Manage your attendance, request leaves, and view your records.",
};

export default function TeacherPortalPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white relative">
            {/* Ambient background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl opacity-50" />
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 glass-strong">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <GraduationCap
                                    size={18}
                                    className="text-white"
                                />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold gradient-text leading-tight">
                                    Madrasa Karam Khan
                                </h1>
                                <p className="text-[10px] text-gray-600 tracking-wider uppercase">
                                    Teacher Portal
                                </p>
                            </div>
                        </div>

                        <LogoutButton />
                    </div>
                </div>
            </header>

            {/* Page content */}
            <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Page title section */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-2.5 mb-1">
                        <LayoutDashboard
                            size={22}
                            className="text-amber-400"
                        />
                        <h1 className="text-2xl font-bold text-white">
                            Teacher Portal
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-[30px]">
                        Manage attendance, leaves, and view your records
                    </p>
                </div>

                {/* Top cards - 2 column on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="animate-fade-in-up-delay">
                        <TodayStatusCard />
                    </div>
                    <div className="animate-fade-in-up-delay2">
                        <LeaveRequestForm />
                    </div>
                </div>

                {/* Attendance history - full width */}
                <div className="animate-fade-in-up-delay3">
                    <AttendanceTable />
                </div>
            </main>
        </div>
    );
}
