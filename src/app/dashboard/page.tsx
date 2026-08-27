"use client";

/**
 * Dashboard Home — main landing page after login.
 * Shows welcome greeting, stats cards, continue learning, and recommended courses.
 * Inspired by iGOT Karmayogi portal home screen.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useRouter } from "next/navigation";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  Target,
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle2,
  Flame,
} from "lucide-react";

interface UserProfile {
  full_name: string;
  role: string;
  designation: string;
}

interface StatsData {
  coursesEnrolled: number;
  coursesCompleted: number;
  hoursLearned: number;
  certificatesEarned: number;
  competencyScore: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  progress_percent: number;
  status: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsData>({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    hoursLearned: 0,
    certificatesEarned: 0,
    competencyScore: 0,
  });
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !session) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch profile status
        const profileRes = await fetch("/api/auth/profile-status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const profileData = await profileRes.json();
        if (profileData.status === "ok" && !profileData.data.profileComplete) {
          router.push("/setup-profile");
          return;
        }
        if (profileData.data?.profile) {
          setProfile(profileData.data.profile);
        }

        // Fetch enrolled courses
        const enrollRes = await fetch("/api/dashboard/enrollments", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const enrollData = await enrollRes.json();
        if (enrollData.status === "ok") {
          setEnrolledCourses(enrollData.data || []);
        }

        // Fetch recommended courses
        const recRes = await fetch("/api/dashboard/recommended", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const recData = await recRes.json();
        if (recData.status === "ok") {
          setRecommendedCourses(recData.data || []);
        }

        // Fetch stats
        const statsRes = await fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const statsData = await statsRes.json();
        if (statsData.status === "ok" && statsData.data) {
          setStats(statsData.data);
        }
      } catch {
        // Use defaults if API not available
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, session, router]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const statCards = [
    {
      label: "Courses Enrolled",
      value: stats.coursesEnrolled,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Hours Learned",
      value: stats.hoursLearned,
      icon: Clock,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Certificates",
      value: stats.certificatesEarned,
      icon: Award,
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Competency Score",
      value: `${stats.competencyScore}%`,
      icon: Target,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const inProgressCourses = enrolledCourses.filter(
    (c) => c.status === "in_progress" || c.progress_percent > 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={fadeUp}>
        <ClayCard className="p-6 bg-gradient-to-r from-primary-500 via-primary-600 to-cyan-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={20} className="text-amber-300" />
              <span className="text-white/80 text-sm font-medium">
                Keep learning!
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {greeting()}, {profile?.full_name || user?.email?.split("@")[0] || "Learner"}!
            </h1>
            <p className="text-white/70 text-sm">
              {profile?.designation
                ? `${profile.designation} — `
                : ""}
              Continue your learning journey and build new competencies.
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                href="/dashboard/learn"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-xl font-semibold text-sm no-underline hover:bg-white/90 transition-colors"
              >
                <BookOpen size={16} />
                Explore Courses
              </Link>
              <Link
                href="/dashboard/my-learning"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white rounded-xl font-semibold text-sm no-underline hover:bg-white/25 transition-colors border border-white/20"
              >
                My Learning
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </ClayCard>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <ClayCard key={stat.label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                >
                  <Icon size={18} className={`bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: stat.color.includes("blue") ? "#3b82f6" : stat.color.includes("emerald") ? "#10b981" : stat.color.includes("amber") ? "#f59e0b" : "#a855f7" }} />
                </div>
              </div>
            </ClayCard>
          );
        })}
      </motion.div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Continue Learning</h2>
            <Link
              href="/dashboard/my-learning"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium no-underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCourses.slice(0, 3).map((course) => (
              <ClayCard key={course.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Play size={16} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {course.source} • {course.duration_hours}h
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-primary-600">
                          {Math.round(course.progress_percent)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full transition-all"
                          style={{ width: `${course.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ClayCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Courses */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recommended For You</h2>
          <Link
            href="/dashboard/learn"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium no-underline flex items-center gap-1"
          >
            Browse All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedCourses.length > 0 ? (
            recommendedCourses.slice(0, 6).map((course) => (
              <ClayCard key={course.id} className="p-4 group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center shrink-0 group-hover:from-primary-200 group-hover:to-cyan-200 transition-colors">
                    <BookOpen size={20} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {course.description || "No description available"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
                        {course.source}
                      </span>
                      <span className="text-xs text-slate-400">
                        {course.duration_hours}h
                      </span>
                    </div>
                  </div>
                </div>
              </ClayCard>
            ))
          ) : (
            // Empty state with sample cards
            <>
              {["Statistical Methods", "Data Analysis with Python", "Digital Governance"].map(
                (title, i) => (
                  <ClayCard key={i} className="p-4 group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center shrink-0">
                        <BookOpen size={20} className="text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Build essential competencies for your role.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
                            iGOT
                          </span>
                          <span className="text-xs text-slate-400">
                            {[2, 4, 3][i]}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </ClayCard>
                )
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Take Assessment", icon: Target, href: "/dashboard/competencies", color: "text-purple-500", bg: "bg-purple-50" },
            { label: "View Certificates", icon: Award, href: "/dashboard/certificates", color: "text-amber-500", bg: "bg-amber-50" },
            { label: "My Competencies", icon: TrendingUp, href: "/dashboard/competencies", color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Browse Courses", icon: BookOpen, href: "/dashboard/learn", color: "text-blue-500", bg: "bg-blue-50" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c1c9d6,-5px_-5px_10px_#ffffff] transition-all no-underline text-center group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon size={18} className={action.color} />
                </div>
                <span className="text-xs font-medium text-slate-700">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
