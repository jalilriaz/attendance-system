import Link from "next/link";
import {
    BookOpen,
    GraduationCap,
    Users,
    Clock,
    Shield,
    Star,
    ChevronRight,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Award,
    Heart,
    BookMarked,
    Sparkles,
} from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
            {/* ─── Ambient Background ─────────────────────────────── */}
            <div className="fixed inset-0 -z-10">
                {/* Large gradient orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[120px] animate-float" />
                <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[120px] animate-float-delay" />
                <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] animate-float-delay2" />
                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* ─── Navigation ─────────────────────────────────────── */}
            <nav className="sticky top-0 z-40 glass-strong">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <BookOpen size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-base sm:text-lg font-bold gradient-text leading-tight">
                                    Madrasa Karam Khan
                                </h1>
                                <p className="text-[10px] sm:text-[11px] text-gray-500 tracking-widest uppercase">
                                    Institute of Islamic Learning
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer"
                            >
                                Sign In
                                <ArrowRight
                                    size={14}
                                    className="group-hover:translate-x-0.5 transition-transform"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ───────────────────────────────────── */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
                <div className="max-w-7xl mx-auto text-center">
                    {/* Badge */}
                    <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-amber-300/90 text-xs sm:text-sm font-medium">
                        <Sparkles size={14} />
                        Established with a Vision for Excellence
                    </div>

                    {/* Main heading */}
                    <h1 className="animate-fade-in-up-delay text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
                        <span className="text-white">Welcome to</span>
                        <br />
                        <span className="gradient-text">
                            Madrasa Karam Khan
                        </span>
                    </h1>

                    <p className="animate-fade-in-up-delay2 max-w-2xl mx-auto text-base sm:text-lg text-gray-400 leading-relaxed mb-10">
                        Nurturing minds with the light of knowledge. Our
                        institution is dedicated to providing quality Islamic
                        education, Hifz-ul-Quran, and modern academic learning
                        in a disciplined environment.
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-fade-in-up-delay3 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] cursor-pointer"
                        >
                            Access Portal
                            <ChevronRight
                                size={18}
                                className="group-hover:translate-x-0.5 transition-transform"
                            />
                        </Link>
                        <a
                            href="#about"
                            className="group flex items-center gap-2 glass hover:bg-white/10 text-white font-medium text-base px-8 py-3.5 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                            Learn More
                            <ChevronRight
                                size={18}
                                className="group-hover:translate-x-0.5 transition-transform"
                            />
                        </a>
                    </div>
                </div>

                {/* Decorative geometric element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] -z-10">
                    <div className="absolute inset-0 border border-amber-500/5 rounded-full animate-spin-slow" />
                    <div className="absolute inset-12 border border-amber-500/5 rounded-full animate-spin-slow" style={{ animationDirection: "reverse" }} />
                    <div className="absolute inset-24 border border-amber-500/3 rounded-full animate-spin-slow" />
                </div>
            </section>

            {/* ─── Stats Bar ──────────────────────────────────────── */}
            <section className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { value: "1:10", label: "Student-Teacher Ratio", icon: Users },
                            { value: "1-on-1", label: "Expert Mentorship", icon: GraduationCap },
                            { value: "Modern", label: "Curriculum Approach", icon: Award },
                            { value: "95%", label: "Success Rate", icon: Star },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="glass rounded-2xl p-5 text-center hover:bg-white/5 transition-all duration-300 group"
                            >
                                <stat.icon
                                    size={22}
                                    className="mx-auto mb-2 text-amber-400/70 group-hover:text-amber-400 transition-colors"
                                />
                                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── About Section ──────────────────────────────────── */}
            <section id="about" className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-400/80 text-sm font-medium tracking-widest uppercase mb-3">
                            About Our Institution
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            A Legacy of{" "}
                            <span className="gradient-text">
                                Knowledge & Faith
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
                            <Heart
                                size={28}
                                className="text-amber-400 mb-4"
                            />
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Our Mission
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                To cultivate a generation of knowledgeable,
                                morally upright individuals grounded in Islamic
                                values. We strive to provide an environment
                                where students can excel in both religious and
                                worldly education, preparing them to be leaders
                                of tomorrow.
                            </p>
                        </div>
                        <div className="glass rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
                            <Star
                                size={28}
                                className="text-amber-400 mb-4"
                            />
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Our Vision
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                To be a leading institution of Islamic learning
                                recognized for academic excellence, spiritual
                                development, and community service. We envision
                                producing Huffaz and scholars who carry the
                                torch of knowledge with integrity and
                                compassion.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Programs Section ───────────────────────────────── */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-400/80 text-sm font-medium tracking-widest uppercase mb-3">
                            Our Programs
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            What We{" "}
                            <span className="gradient-text">Offer</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: BookMarked,
                                title: "Hifz-ul-Quran",
                                desc: "Complete Quran memorization program under expert supervision with Tajweed and proper recitation techniques.",
                                color: "from-emerald-400 to-emerald-600",
                                shadow: "shadow-emerald-500/10",
                            },
                            {
                                icon: BookOpen,
                                title: "Nazra Quran",
                                desc: "Foundational Quran reading with correct pronunciation, Makharij al-Huroof, and basic Tajweed rules.",
                                color: "from-sky-400 to-sky-600",
                                shadow: "shadow-sky-500/10",
                            },
                            {
                                icon: GraduationCap,
                                title: "Islamic Studies",
                                desc: "Comprehensive Islamic education covering Fiqh, Hadith, Seerah, and Islamic history for all age groups.",
                                color: "from-violet-400 to-violet-600",
                                shadow: "shadow-violet-500/10",
                            },
                            {
                                icon: Users,
                                title: "Personality Grooming",
                                desc: "Focuses on developing interpersonal skills, confidence, Sunnah-compliant etiquette (Adab), and leadership qualities.",
                                color: "from-rose-400 to-rose-600",
                                shadow: "shadow-rose-500/10",
                            },
                            {
                                icon: Award,
                                title: "Character Building",
                                desc: "Focus on moral and ethical development, discipline, and building strong character rooted in Islamic values.",
                                color: "from-amber-400 to-amber-600",
                                shadow: "shadow-amber-500/10",
                            },
                            {
                                icon: Shield,
                                title: "Modern Education",
                                desc: "Supplementary academic subjects including Mathematics, Urdu, English, and Computer literacy for holistic development.",
                                color: "from-teal-400 to-teal-600",
                                shadow: "shadow-teal-500/10",
                            },
                        ].map((program, i) => (
                            <div
                                key={i}
                                className={`glass rounded-2xl p-7 hover:bg-white/5 transition-all duration-300 group hover:-translate-y-1 ${program.shadow}`}
                            >
                                <div
                                    className={`w-12 h-12 bg-gradient-to-br ${program.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                                >
                                    <program.icon
                                        size={22}
                                        className="text-white"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {program.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {program.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Class Timings Section ────────────────────────── */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-400/80 text-sm font-medium tracking-widest uppercase mb-3">
                            Schedule
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            Class{" "}
                            <span className="gradient-text">Timings</span>
                        </h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
                        <div className="p-6 sm:p-8">
                            <div className="grid gap-3">
                                {[
                                    { days: "Monday – Thursday", time: "8:00 AM – 3:00 PM", hours: "7 hrs", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
                                    { days: "Friday", time: "8:00 AM – 12:00 PM", hours: "4 hrs", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/10" },
                                    { days: "Saturday", time: "8:00 AM – 3:00 PM", hours: "7 hrs", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
                                    { days: "Sunday", time: "Off Day", hours: "—", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/10" },
                                ].map((row, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between p-4 rounded-xl ${row.bg} border ${row.border} transition-all hover:scale-[1.01]`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className={row.color} />
                                            <span className="text-sm sm:text-base font-medium text-white">{row.days}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-semibold ${row.color}`}>{row.time}</span>
                                            <span className="text-xs text-gray-500 hidden sm:inline">({row.hours})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Features Section (Attendance System) ───────────── */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-400/80 text-sm font-medium tracking-widest uppercase mb-3">
                            Digital Management
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            Smart Attendance{" "}
                            <span className="gradient-text">System</span>
                        </h2>
                        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                            Our digital attendance management system streamlines
                            daily operations for teachers and administrators.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            {
                                icon: Clock,
                                title: "Quick Check-In",
                                desc: "One-tap attendance marking with automatic late detection",
                            },
                            {
                                icon: Shield,
                                title: "Secure Access",
                                desc: "Role-based authentication for teachers and admins",
                            },
                            {
                                icon: BookOpen,
                                title: "Leave Management",
                                desc: "Easy leave requests with approval workflow",
                            },
                            {
                                icon: Star,
                                title: "Analytics",
                                desc: "Monthly attendance reports and working hour tracking",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 text-center group"
                            >
                                <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                                    <feature.icon
                                        size={20}
                                        className="text-amber-400"
                                    />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1.5">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ────────────────────────────────────── */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent" />
                        <div className="absolute inset-0 glass-strong" />

                        <div className="relative p-10 sm:p-14 text-center">
                            <GraduationCap
                                size={40}
                                className="mx-auto mb-5 text-amber-400"
                            />
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Ready to Access Your Portal?
                            </h2>
                            <p className="text-gray-400 max-w-lg mx-auto mb-8">
                                Teachers and administrators can sign in to manage
                                attendance, view records, and handle leave requests
                                through our secure digital system.
                            </p>
                            <Link
                                href="/login"
                                className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] cursor-pointer"
                            >
                                Sign In Now
                                <ArrowRight
                                    size={18}
                                    className="group-hover:translate-x-0.5 transition-transform"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Contact Section ───────────────────────────────── */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-400/80 text-sm font-medium tracking-widest uppercase mb-3">
                            Get in Touch
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            Contact{" "}
                            <span className="gradient-text">Us</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            {
                                icon: Phone,
                                title: "Phone",
                                info: "+92313-5187962",
                                sub: "Mon - Sat, 8AM - 3PM",
                            },
                            {
                                icon: Mail,
                                title: "Email",
                                info: "ksaadatali7@gmail.com",
                                sub: "We reply within 24 hours",
                            },
                            {
                                icon: MapPin,
                                title: "Location",
                                info: "Madrassa Karam Khan",
                                sub: "VPO Nothain Malkan, Tehsil Pindigheb, District Attock",
                            },
                        ].map((contact, i) => (
                            <div
                                key={i}
                                className="glass rounded-2xl p-6 text-center hover:bg-white/5 transition-all duration-300 group"
                            >
                                <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-500/20 transition-colors">
                                    <contact.icon
                                        size={20}
                                        className="text-amber-400"
                                    />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1">
                                    {contact.title}
                                </h3>
                                <p className="text-sm text-gray-300">
                                    {contact.info}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {contact.sub}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Footer ─────────────────────────────────────────── */}
            <footer className="border-t border-white/5 px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                                <BookOpen size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold gradient-text">
                                    Madrasa Karam Khan
                                </p>
                                <p className="text-[10px] text-gray-600">
                                    Institute of Islamic Learning
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600">
                            © {new Date().getFullYear()} Madrasa Karam Khan.
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
