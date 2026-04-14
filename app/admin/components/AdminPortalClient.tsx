"use client";

import { useState } from "react";
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    CalendarDays,
    BarChart3,
    FileText,
    Bell,
} from "lucide-react";
import LogoutButton from "./LogoutButton";
import AdminDashboardContent from "./AdminDashboardContent";
import ManageTeachers from "./ManageTeachers";
import ManageHolidays from "./ManageHolidays";
import LeaveRequests from "./LeaveRequests";
import ViewReports from "./ViewReports";

const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "teachers", label: "Teachers", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "holidays", label: "Holidays", icon: CalendarDays },
    { id: "leaves", label: "Leaves", icon: FileText },
];

export default function AdminPortalClient() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <AdminDashboardContent onNavigate={setActiveTab} />
                );
            case "teachers":
                return <ManageTeachers />;
            case "reports":
                return <ViewReports />;
            case "holidays":
                return <ManageHolidays />;
            case "leaves":
                return <LeaveRequests />;
            default:
                return null;
        }
    };

    const currentTab = tabs.find((t) => t.id === activeTab);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white relative">
            {/* Ambient background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/4 rounded-full blur-[100px] animate-float-delay" />
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                    Admin Portal
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setActiveTab("leaves")}
                                className="relative text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                            >
                                <Bell size={18} />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                            </button>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Page content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Page title */}
                <div className="mb-6 animate-fade-in-up">
                    <div className="flex items-center gap-2.5 mb-1">
                        {currentTab && (
                            <currentTab.icon
                                size={22}
                                className="text-amber-400"
                            />
                        )}
                        <h1 className="text-2xl font-bold text-white">
                            {currentTab?.label === "Dashboard"
                                ? "Admin Dashboard"
                                : currentTab?.label}
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-[30px]">
                        {activeTab === "dashboard" &&
                            "Manage teachers, attendance records, and system settings"}
                        {activeTab === "teachers" &&
                            "View and manage all registered teachers"}
                        {activeTab === "reports" &&
                            "Monthly attendance reports and analytics"}
                        {activeTab === "holidays" &&
                            "Add or remove holidays from the system calendar"}
                        {activeTab === "leaves" &&
                            "Review and manage teacher leave requests"}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="sticky top-[72px] z-30 mb-6 flex items-center gap-1 glass rounded-xl p-1.5 overflow-x-auto shadow-lg shadow-black/20">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-gradient-to-r from-amber-500/15 to-amber-600/15 text-amber-400 shadow-sm"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            }`}
                        >
                            <tab.icon size={16} />
                            <span className="hidden sm:inline">
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {renderContent()}
            </main>
        </div>
    );
}
