"use client";
/**
 * Dashboard — main authenticated user page.
 *
 * Shows:
 * 1. Profile summary with gamification stats (XP, streak, badges)
 * 2. Competency radar chart (inline SVG)
 * 3. Personalized course recommendations with explanation tags
 * 4. Enrollment stats: active courses, completed, certificates, hours
 * 5. Quick links to assessment, heatmap, etc.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { supabase } from "@/lib/supabaseClient";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Tooltip } from "@/components/ui/Tooltip";
import { AIVoiceChat } from "@/components/chatbot/AIVoiceChat";
import {
  User,
  BookOpen,
  BarChart3,
  LogOut,
  ExternalLink,
  Loader2,
  ArrowRight,
  Flame,
  Trophy,
  Target,
  Zap,
  Sparkles,
  TrendingUp,
  Award,
  Info,
  PlayCircle,
} from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  designation: string;
  organisation: string;
  ministry: string;
  state: string;
  government_level: string;
  job_role: string;
  education_level: string;
  years_of_experience: number;
  profile_complete: boolean;
  preferred_language: string;
}

interface CompetencyScore {
  name: string;
  domain: string;
  score: number;
}

interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  badges: Array<{ id: string; name: string; earnedAt: string | null; category: string }>;
  nextLevelXp: number;
}

interface Recommendation {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  source: string;
  externalUrl: string;
  score: number;
  signal: string;
  explanation: string;
  competencies: string[];
}

interface IGOTCourse {
  id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  external_url: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
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
  const { user, session, signOut } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [competencies, setCompetencies] = useState<CompetencyScore[]>([]);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [igotCourses, setIgotCourses] = useState<IGOTCourse[]>([]);
  const [stats, setStats] = useState<{ coursesEnrolled: number; coursesCompleted: number; hoursLearned: number; certificatesEarned: number; competencyScore: number } | null>(null);
  const [enrollments, setEnrollments] = useState<Array<{ id: string; course_id: string; status: string; progress_percent: number; course?: IGOTCourse }>>([]);
  const [trendingCerts, setTrendingCerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !session) return;

    const loadData = async () => {
      const token = session.access_token;

      // Check profile completion
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof && !prof.profile_complete) {
        router.push("/setup-profile");
        return;
      }
      setProfile(prof);

      // Fetch competencies
      try {
        const compResp = await fetch("/api/dashboard/competencies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (compResp.ok) {
          const compData = await compResp.json();
          if (compData.status === "ok") setCompetencies(compData.data || []);
        }
      } catch { /* silent */ }

      // Fetch gamification profile
      try {
        const gamResp = await fetch("/api/gamification/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (gamResp.ok) {
          const gamData = await gamResp.json();
          if (gamData.status === "ok") setGamification(gamData.data);
        }
      } catch { /* silent */ }

      // Fetch personalized recommendations
      try {
        const recResp = await fetch("/api/recommendations?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (recResp.ok) {
          const recData = await recResp.json();
          if (recData.status === "ok") setRecommendations(recData.data || []);
        }
      } catch { /* silent */ }

      // Fetch dashboard stats (enrolled, completed, certificates)
      try {
        const statsResp = await fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsResp.ok) {
          const statsData = await statsResp.json();
          if (statsData.status === "ok") setStats(statsData.data);
        }
      } catch { /* silent */ }

      // Fetch iGOT courses (fallback: direct iGOT API)
      try {
        const coursesResp = await fetch("/api/courses?limit=10");
        if (coursesResp.ok) {
          const coursesData = await coursesResp.json();
          if (coursesData.data && coursesData.data.length > 0) {
            setIgotCourses(coursesData.data);
          } else {
            throw new Error("empty");
          }
        } else {
          throw new Error("failed");
        }
      } catch {
        try {
          const IGOT_IDS = [
            "do_113923174474121216195", "do_1141533540853432321675",
            "do_1143166853070028801812", "do_1143052789530787841562",
            "do_113569878939262976132",
          ];
          const results = await Promise.allSettled(
            IGOT_IDS.slice(0, 5).map(async (id) => {
              const r = await fetch(`https://igotkarmayogi.gov.in/api/content/v1/read/${id}`, { signal: AbortSignal.timeout(8000) });
              if (!r.ok) return null;
              const d = await r.json();
              const c = d?.result?.content;
              if (!c) return null;
              return {
                id: c.identifier || id,
                title: c.name,
                description: (c.description || "").replace(/<[^>]*>/g, "").substring(0, 200),
                source: "igot",
                duration_hours: Math.round((parseInt(c.duration || "0") / 3600) * 10) / 10 || 0.5,
                external_url: `https://portal.igotkarmayogi.gov.in/public/toc/${c.identifier || id}/overview`,
              };
            })
          );
          const fetched = results
            .filter((r): r is PromiseFulfilledResult<IGOTCourse> => r.status === "fulfilled" && r.value !== null)
            .map((r) => r.value);
          if (fetched.length > 0) setIgotCourses(fetched);
        } catch { /* silent */ }
      }

      // Fetch enrollments for ongoing courses
      try {
        const { data: enrollData } = await supabase
          .from("enrollments")
          .select("id, course_id, status, progress_percent")
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false });

        if (enrollData && enrollData.length > 0) {
          const enriched = await Promise.all(
            enrollData.slice(0, 5).map(async (e) => {
              // Try to get course title from iGOT
              try {
                const r = await fetch(`https://igotkarmayogi.gov.in/api/content/v1/read/${e.course_id}`, { signal: AbortSignal.timeout(5000) });
                if (r.ok) {
                  const d = await r.json();
                  const c = d?.result?.content;
                  if (c) return { ...e, course: { id: c.identifier || e.course_id, title: c.name, description: (c.description || "").replace(/<[^>]*>/g, "").substring(0, 100), source: "igot", duration_hours: 0.5, external_url: `https://portal.igotkarmayogi.gov.in/public/toc/${c.identifier || e.course_id}/overview` } };
                }
              } catch { /* silent */ }
              return { ...e, course: { id: e.course_id, title: e.course_id.replace("do_", "Course "), description: "", source: "igot", duration_hours: 0, external_url: "" } };
            })
          );
          setEnrollments(enriched);
        }
      } catch { /* silent */ }

      // Generate trending certifications via AI (non-blocking)
      try {
        const aiResp = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ message: "List 5 trending certifications for government officials in India in 2026. Just the names, one per line, no numbers or bullets.", context: "User is a government official looking for trending certifications." }),
        });
        if (aiResp.ok) {
          const aiData = await aiResp.json();
          if (aiData.response) {
            const certs = aiData.response.split("\n").filter((s: string) => s.trim().length > 3).slice(0, 5);
            setTrendingCerts(certs);
          }
        }
      } catch { /* silent */ }

      setLoading(false);
    };

    loadData();
  }, [user, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  // Compute radar chart points from competencies
  const radarComps = competencies.slice(0, 8);
  const radarPoints = radarComps.map((c, i) => {
    const angle = (i / Math.max(radarComps.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const radius = (c.score / 100) * 100;
    return {
      x: 120 + radius * Math.cos(angle),
      y: 120 + radius * Math.sin(angle),
      label: c.name.length > 12 ? c.name.substring(0, 10) + "..." : c.name,
      score: c.score,
    };
  });
  const radarPolygon = radarPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const overallScore = competencies.length > 0
    ? Math.round(competencies.reduce((s, c) => s + c.score, 0) / competencies.length)
    : 0;

  const earnedBadges = gamification?.badges?.filter((b) => b.earnedAt) || [];
  const levelProgress = gamification ? Math.min(100, (gamification.xp / Math.max(gamification.nextLevelXp, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome, {profile?.full_name || user?.email?.split("@")[0]}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {profile?.designation} {profile?.organisation ? `at ${profile.organisation}` : ""}
            </p>
          </div>            <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            style={{ borderRadius: "4px" }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Top Row: Gamification Stats with Tooltips */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {/* XP Card */}
          <Tooltip content={t("tip_xp")}>
            <ClayCard className="p-4 cursor-help">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 flex items-center justify-center" style={{ borderRadius: "4px" }}>
                  <Zap size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("dash_xp")}</p>
                  <p className="text-xl font-bold text-slate-800">{gamification?.xp || 0}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full h-1.5 bg-slate-100" style={{ borderRadius: "4px" }}>
                  <div className="h-full bg-amber-500" style={{ width: `${levelProgress}%`, borderRadius: "4px" }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Level {gamification?.level || 0}</p>
              </div>
            </ClayCard>
          </Tooltip>

          {/* Streak Card */}
          <Tooltip content={t("tip_streak")}>
            <ClayCard className="p-4 cursor-help">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 flex items-center justify-center" style={{ borderRadius: "4px" }}>
                  <Flame size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("dash_streak")}</p>
                  <p className="text-xl font-bold text-slate-800">{gamification?.streak || 0}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{t("dash_days_row")}</p>
            </ClayCard>
          </Tooltip>

          {/* Badges Card */}
          <Tooltip content={t("tip_badges")}>
            <a href="/dashboard/competencies" className="block no-underline">
              <ClayCard className="p-4 cursor-help hover:border-primary-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 flex items-center justify-center" style={{ borderRadius: "4px" }}>
                    <Trophy size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("dash_badges")}</p>
                    <p className="text-xl font-bold text-slate-800">{earnedBadges.length}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">{t("dash_of")} 8 earned</p>
              </ClayCard>
            </a>
          </Tooltip>

          {/* Courses Enrolled */}
          <Tooltip content={t("tip_courses")}>
            <a href="/dashboard/learn" className="block no-underline">
              <ClayCard className="p-4 cursor-help hover:border-primary-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 flex items-center justify-center" style={{ borderRadius: "4px" }}>
                    <BookOpen size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("dash_courses")}</p>
                    <p className="text-xl font-bold text-slate-800">{stats?.coursesEnrolled || 0}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">{stats?.coursesCompleted || 0} completed</p>
              </ClayCard>
            </a>
          </Tooltip>

          {/* Certificates */}
          <Tooltip content={t("tip_certificates")}>
            <ClayCard className="p-4 cursor-help">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center" style={{ borderRadius: "4px" }}>
                  <Award size={20} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("dash_certificates")}</p>
                  <p className="text-xl font-bold text-slate-800">{stats?.certificatesEarned || 0}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">earned</p>
            </ClayCard>
          </Tooltip>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Profile + Radar + Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ClayCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-500 flex items-center justify-center text-white font-semibold text-sm" style={{ borderRadius: "4px" }}>
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{profile?.full_name || "User"}</h3>
                  <p className="text-xs text-slate-400">{profile?.email || user?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <InfoRow label="Level" value={profile?.government_level} capitalize />
                {profile?.ministry && <InfoRow label="Ministry" value={profile.ministry} />}
                {profile?.designation && <InfoRow label="Designation" value={profile.designation} />}
                {profile?.job_role && <InfoRow label="Job Role" value={profile.job_role} />}
                {profile?.years_of_experience != null && (
                  <InfoRow label="Experience" value={`${profile.years_of_experience} years`} />
                )}
              </div>
            </ClayCard>

            {/* Competency Radar */}
            {competencies.length > 0 && (
              <ClayCard className="p-6 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Competency Radar</h3>
                <svg width="240" height="240" viewBox="0 0 240 240" className="w-full max-w-[220px]">
                  {[25, 50, 75, 100].map((pct) => (
                    <circle key={pct} cx="120" cy="120" r={pct} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  ))}
                  {radarPoints.map((_, i) => {
                    const angle = (i / radarPoints.length) * 2 * Math.PI - Math.PI / 2;
                    return (
                      <line key={i} x1="120" y1="120" x2={120 + 100 * Math.cos(angle)} y2={120 + 100 * Math.sin(angle)} stroke="#e2e8f0" strokeWidth="1" />
                    );
                  })}
                  <polygon points={radarPolygon} fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2" />
                  {radarPoints.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
                      <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[8px] fill-slate-500">{p.label}</text>
                    </g>
                  ))}
                </svg>
                <p className="text-xs text-slate-400 mt-2">Overall: {overallScore}%</p>
              </ClayCard>
            )}

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <ClayCard className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Earned Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.slice(0, 6).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 font-medium">
                      <Trophy size={12} />
                      {badge.name}
                    </div>
                  ))}
                </div>
              </ClayCard>
            )}

            {/* Quick Actions */}
            <ClayCard className="p-6">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ActionLink icon={<BarChart3 size={16} />} label="Take Assessment" href="/assessment" />
                <ActionLink icon={<BookOpen size={16} />} label="Browse Courses" href="/courses" />
                <ActionLink icon={<BarChart3 size={16} />} label="Skill Heatmap" href="/dashboard/heatmap" />
                <ActionLink icon={<Target size={16} />} label="Competencies" href="/dashboard/competencies" />
              </div>
            </ClayCard>
          </div>

          {/* Right column — Recommendations + Courses + TPAC */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personalized Recommendations */}
            {recommendations.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <ClayCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-amber-500" />
                    <h3 className="font-semibold text-slate-800">Recommended for You</h3>
                  </div>
                  <div className="space-y-3">
                    {recommendations.slice(0, 4).map((rec) => (
                      <div
                        key={rec.courseId}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-50/50 to-cyan-50/50 border border-primary-100 hover:border-primary-200 transition-colors cursor-pointer"
                        onClick={() => router.push(`/courses/${rec.courseId}`)}
                      >
                        <div className="shrink-0 w-8 h-8 bg-primary-100 flex items-center justify-center" style={{ borderRadius: "4px" }}>
                          <TrendingUp size={14} className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{rec.courseTitle}</p>
                          <p className="text-xs text-primary-600 mt-0.5 font-medium">{rec.explanation}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 text-primary-700 font-medium" style={{ borderRadius: "4px" }}>
                              {Math.round(rec.score * 100)}% match
                            </span>
                            <span className="text-[10px] text-slate-400">{rec.signal}</span>
                          </div>
                        </div>
                        <ExternalLink size={14} className="shrink-0 text-slate-400 mt-1" />
                      </div>
                    ))}
                  </div>
                </ClayCard>
              </motion.div>
            )}

            {/* Ongoing Courses */}
            {enrollments.filter((e) => e.status === "in_progress").length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
                <ClayCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle size={18} className="text-blue-500" />
                      <h3 className="font-semibold text-slate-800">{t("dash_ongoing")}</h3>
                    </div>
                    <a href="/dashboard/learn" className="text-xs text-primary-600 hover:text-primary-700 font-medium">{t("dash_view_all")} →</a>
                  </div>
                  <div className="space-y-3">
                    {enrollments.filter((e) => e.status === "in_progress").slice(0, 3).map((enroll) => (
                      <div
                        key={enroll.id}
                        className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 cursor-pointer hover:border-blue-200 transition-colors"
                        style={{ borderRadius: "4px" }}
                        onClick={() => router.push(`/courses/${enroll.course_id}`)}
                      >
                        <BookOpen size={16} className="text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{enroll.course?.title || enroll.course_id}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-blue-200" style={{ borderRadius: "4px" }}>
                              <div className="h-full bg-blue-500" style={{ width: `${enroll.progress_percent || 0}%`, borderRadius: "4px" }} />
                            </div>
                            <span className="text-[10px] text-blue-600 font-medium">{Math.round(enroll.progress_percent || 0)}%</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-blue-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </ClayCard>
              </motion.div>
            )}

            {/* iGOT Courses / Suggested for You */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <ClayCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-primary-600" />
                    <h3 className="font-semibold text-slate-800">{recommendations.length > 0 ? t("dash_suggested") : t("dash_igot_courses")}</h3>
                  </div>
                  <a href="/dashboard/learn" className="text-xs text-primary-600 hover:text-primary-700 font-medium">{t("dash_view_all")} →</a>
                </div>
                {igotCourses.length === 0 ? (
                  <p className="text-slate-400 text-sm">No courses available.</p>
                ) : (
                  <div className="space-y-3">
                    {igotCourses.slice(0, 4).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/courses/${course.id}`)}
                      >
                        <div className="shrink-0 w-8 h-8 bg-primary-50 flex items-center justify-center" style={{ borderRadius: "4px" }}>
                          <BookOpen size={14} className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{course.title}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{course.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 font-medium" style={{ borderRadius: "4px" }}>iGOT</span>
                            {course.duration_hours > 0 && (
                              <span className="text-[10px] text-slate-400">{course.duration_hours}h</span>
                            )}
                          </div>
                        </div>
                        {course.external_url && (
                          <a href={course.external_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-slate-400 hover:text-primary-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ClayCard>
            </motion.div>

            {/* Trending Certifications (AI-generated) */}
            {trendingCerts.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
                <ClayCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={18} className="text-emerald-500" />
                    <h3 className="font-semibold text-slate-800">{t("dash_trending_cert")}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-medium" style={{ borderRadius: "4px" }}>AI</span>
                  </div>
                  <div className="space-y-2">
                    {trendingCerts.map((cert, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-100" style={{ borderRadius: "4px" }}>
                        <span className="w-6 h-6 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ borderRadius: "4px" }}>{i + 1}</span>
                        <span className="text-sm text-slate-700 font-medium">{cert}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                    <Sparkles size={10} /> AI-curated based on current government training trends
                  </p>
                </ClayCard>
              </motion.div>
            )}

          </div>
        </div>
      </div>
      {/* AI Voice Chat */}
      <AIVoiceChat
        courseTitle={enrollments[0]?.course?.title}
        courseDescription={enrollments[0]?.course?.description}
      />
    </div>
  );
}

function InfoRow({ label, value, capitalize }: { label: string; value?: string; capitalize?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`text-slate-700 font-medium text-right max-w-[60%] truncate ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}

function ActionLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors no-underline group" style={{ borderRadius: "4px" }}>
      <div className="w-8 h-8 bg-slate-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors" style={{ borderRadius: "4px" }}>
        <span className="text-slate-500 group-hover:text-primary-600 transition-colors">{icon}</span>
      </div>
      <span className="text-sm text-slate-600 font-medium flex-1">{label}</span>
      <ArrowRight size={14} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
    </a>
  );
}
