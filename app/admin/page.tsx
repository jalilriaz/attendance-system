import type { Metadata } from "next";
import AdminPortalClient from "./components/AdminPortalClient";

export const metadata: Metadata = {
    title: "Admin Portal | Madrasa Karam Khan",
    description:
        "Administration dashboard for managing teachers, attendance, and operations.",
};

export default function AdminPortalPage() {
    return <AdminPortalClient />;
}
