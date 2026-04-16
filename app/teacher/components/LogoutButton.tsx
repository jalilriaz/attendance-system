"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                router.push("/");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <LogOut size={16} />
            )}
            <span className="hidden sm:inline">Sign Out</span>
        </button>
    );
}
