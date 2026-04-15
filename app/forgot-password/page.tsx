"use client";

import { useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Mail,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Send,
} from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || "Something went wrong. Please try again.");
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
                            Reset Password
                        </h1>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Enter your email address and we&apos;ll send you a link to reset your password
                        </p>
                    </div>

                    {/* Success state */}
                    {success ? (
                        <div className="animate-fade-in-up-delay glass-strong rounded-2xl p-7 sm:p-8">
                            {/* Success icon */}
                            <div className="flex justify-center mb-5">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>
                            </div>

                            <h2 className="text-lg font-semibold text-center text-white mb-2">
                                Check Your Email
                            </h2>
                            <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
                                If an account exists for <span className="text-amber-400 font-medium">{email}</span>, you&apos;ll receive a password reset link shortly. Please check your inbox and spam folder.
                            </p>

                            {/* Divider */}
                            <div className="border-t border-white/5 my-5" />

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setSuccess(false);
                                        setEmail("");
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                                >
                                    <Mail size={16} />
                                    Try a different email
                                </button>
                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-300 transition-all"
                                >
                                    <ArrowLeft size={14} />
                                    Return to login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Form card */
                        <div className="animate-fade-in-up-delay glass-strong rounded-2xl p-7 sm:p-8">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-6 text-amber-400">
                                <Mail size={18} />
                                <span className="text-sm font-semibold">
                                    Forgot Password
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
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="reset-email"
                                        className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2"
                                    >
                                        <Mail size={13} />
                                        Email Address
                                    </label>
                                    <input
                                        id="reset-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your registered email"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
                                        autoComplete="email"
                                        autoFocus
                                    />
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
                                        <Send size={16} />
                                    )}
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="border-t border-white/5 my-5" />

                            {/* Back to login */}
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back to login
                            </Link>
                        </div>
                    )}

                    {/* Security notice */}
                    <div className="animate-fade-in-up-delay3 mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                        <ShieldCheck size={12} />
                        Reset links expire after 15 minutes
                    </div>
                </div>
            </div>
        </div>
    );
}
