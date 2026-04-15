"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    BookOpen,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    KeyRound,
} from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [invalidToken, setInvalidToken] = useState(false);

    useEffect(() => {
        if (!token) {
            setInvalidToken(true);
        }
    }, [token]);

    // Password strength indicator
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { label: "", color: "", width: "0%" };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
        if (score <= 3) return { label: "Fair", color: "bg-amber-500", width: "66%" };
        return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setError(data.error || "Failed to reset password. Please try again.");
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
                <div className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] bg-amber-500/6 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] animate-float-delay" />
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Back to login */}
            <div className="p-4 sm:p-6">
                <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <ArrowLeft
                        size={16}
                        className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    Back to Login
                </Link>
            </div>

            {/* Form container */}
            <div className="flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-md">
                    {/* Logo and title */}
                    <div className="text-center mb-10 animate-fade-in-up">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20">
                            <BookOpen size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold gradient-text mb-2">
                            New Password
                        </h1>
                        <p className="text-sm text-gray-500">
                            Create a new secure password for your account
                        </p>
                    </div>

                    {/* Invalid token state */}
                    {invalidToken ? (
                        <div className="animate-fade-in-up-delay glass-strong rounded-2xl p-7 sm:p-8 text-center">
                            <div className="flex justify-center mb-5">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <AlertCircle size={32} className="text-red-400" />
                                </div>
                            </div>
                            <h2 className="text-lg font-semibold text-white mb-2">
                                Invalid Reset Link
                            </h2>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                This password reset link is invalid or has expired. Please request a new one.
                            </p>
                            <Link
                                href="/forgot-password"
                                className="inline-flex items-center justify-center gap-2 font-semibold text-sm py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
                            >
                                <KeyRound size={16} />
                                Request New Link
                            </Link>
                        </div>
                    ) : success ? (
                        /* Success state */
                        <div className="animate-fade-in-up-delay glass-strong rounded-2xl p-7 sm:p-8 text-center">
                            <div className="flex justify-center mb-5">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>
                            </div>
                            <h2 className="text-lg font-semibold text-white mb-2">
                                Password Reset Successful
                            </h2>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                Your password has been updated. Redirecting you to the login page...
                            </p>
                            <div className="flex justify-center">
                                <Loader2 size={20} className="animate-spin text-amber-400" />
                            </div>
                        </div>
                    ) : (
                        /* Form card */
                        <div className="animate-fade-in-up-delay glass-strong rounded-2xl p-7 sm:p-8">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-6 text-amber-400">
                                <KeyRound size={18} />
                                <span className="text-sm font-semibold">
                                    Set New Password
                                </span>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5 animate-fade-in">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password */}
                                <div>
                                    <label
                                        htmlFor="new-password"
                                        className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2"
                                    >
                                        <Lock size={13} />
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new-password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError("");
                                            }}
                                            placeholder="Enter new password"
                                            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
                                            autoComplete="new-password"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Password strength bar */}
                                    {password && (
                                        <div className="mt-2.5 space-y-1.5 animate-fade-in">
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                                                    style={{ width: strength.width }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Strength: <span className={`font-medium ${strength.color === "bg-red-500" ? "text-red-400" : strength.color === "bg-amber-500" ? "text-amber-400" : "text-emerald-400"}`}>{strength.label}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="confirm-password"
                                        className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2"
                                    >
                                        <Lock size={13} />
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setError("");
                                            }}
                                            placeholder="Confirm new password"
                                            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Password match indicator */}
                                    {confirmPassword && (
                                        <div className="mt-2 animate-fade-in">
                                            {password === confirmPassword ? (
                                                <p className="text-xs text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Passwords match
                                                </p>
                                            ) : (
                                                <p className="text-xs text-red-400 flex items-center gap-1">
                                                    <AlertCircle size={12} /> Passwords do not match
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 hover:shadow-amber-500/30"
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={18} />
                                    )}
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        </div>
                    )}

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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-amber-400" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
