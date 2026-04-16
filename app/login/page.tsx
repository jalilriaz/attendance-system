"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    BookOpen,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowLeft,
    ShieldCheck,
    GraduationCap,
    AlertCircle,
    CheckCircle2,
    School,
} from "lucide-react";

type Role = "teacher" | "admin";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeRole, setActiveRole] = useState<Role>("teacher");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success) {
                const userRole = data.user.role;
                if (userRole === "admin") {
                    router.push("/admin");
                } else if (userRole === "teacher") {
                    router.push("/teacher");
                } else {
                    router.push("/");
                }
            } else {
                setError(data.error || "Login failed. Please try again.");
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] bg-amber-500/6 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl opacity-50" />
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Back to home */}
            <div className="p-4 sm:p-6">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <ArrowLeft
                        size={16}
                        className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    Back to Home
                </Link>
            </div>

            {/* Login form container */}
            <div className="flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-md">
                    {/* Logo and title */}
                    <div className="text-center mb-10 animate-fade-in-up">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20">
                            <BookOpen size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold gradient-text mb-2">
                            Madrasa Karam Khan
                        </h1>
                        <p className="text-sm text-gray-500">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Role selector tabs */}
                    <div className="animate-fade-in-up-delay flex glass rounded-xl p-1.5 mb-8">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveRole("teacher");
                                setError("");
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeRole === "teacher"
                                ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            <GraduationCap size={16} />
                            Teacher
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveRole("admin");
                                setError("");
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeRole === "admin"
                                ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            <School size={16} />
                            Admin
                        </button>
                    </div>

                    {/* Login form card */}
                    <div className="animate-fade-in-up-delay2 glass-strong rounded-2xl p-7 sm:p-8">
                        {/* Role indicator */}
                        <div className="flex items-center gap-2 mb-6">
                            {activeRole === "teacher" ? (
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <GraduationCap size={18} />
                                    <span className="text-sm font-semibold">
                                        Teacher Login
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-amber-400">
                                    <School size={18} />
                                    <span className="text-sm font-semibold">
                                        Admin Login
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5 animate-fade-in">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2"
                                >
                                    <Mail size={13} />
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    placeholder={
                                        activeRole === "teacher"
                                            ? ""
                                            : ""
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2"
                                >
                                    <Lock size={13} />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password */}
                            <div className="flex justify-end -mt-1">
                                <Link
                                    href="/forgot-password"
                                    className={`text-xs font-medium transition-colors ${
                                        activeRole === "teacher"
                                            ? "text-emerald-400/70 hover:text-emerald-400"
                                            : "text-amber-400/70 hover:text-amber-400"
                                    }`}
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${activeRole === "teacher"
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30"
                                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 hover:shadow-amber-500/30"
                                    }`}
                            >
                                {loading ? (
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <CheckCircle2 size={18} />
                                )}
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>
                    </div>

                    {/* Security notice */}
                    <div className="animate-fade-in-up-delay3 mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                        <ShieldCheck size={12} />
                        Secured with encrypted authentication
                    </div>
                </div>
            </div>
        </div>
    );
}
