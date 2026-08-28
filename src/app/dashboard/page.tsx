"use client";
/**
 * Dashboard — main authenticated user page.
 *
 * Shows:
 * 1. Profile summary with iGOT sync status
 * 2. Available iGOT courses
 * 3. Upcoming NSSTA TPAC training sessions
 * 4. Quick links to competency assessment
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { supabase } from "@/lib/supabaseClient";
import { ClayCard } from "@/components/ui";
import { getTPACSessions } from "@/lib/api";
import {
  User,
  BookOpen,
  Calendar,
  BarChart3,
  LogOut,
  ExternalLink,
  Loader2,
  ArrowRight,
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
}

interface TPACSession {
  id: string;
  title: string;
  description: string;
  training_type: string;
  start_date: string;
  end_date: string;
  location: string;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tpacSessions, setTpacSessions] = useState<TPACSession[]>([]);
  const [igotCourses, setIgotCourses] = useState<IGOTCourse[]>([]);
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

      // Fetch courses from backend API
      try {
        const coursesResp = await fetch("/api/courses?limit=10");
        if (coursesResp.ok) {
          const coursesData = await coursesResp.json();
          if (coursesData.data) setIgotCourses(coursesData.data as IGOTCourse[]);
        }
      } catch {
        // Fallback: try Supabase directly
        const { data: courses } = await supabase
          .from("courses")
          .select("*")
          .eq("is_active", true)
          .limit(10);
        if (courses) setIgotCourses(courses as IGOTCourse[]);
      }

      // Fetch TPAC sessions
      const tpacResp = await getTPACSessions(token);
      if (tpacResp.data && typeof tpacResp.data === "object" && "data" in tpacResp.data) {
        setTpacSessions((tpacResp.data as { data: TPACSession[] }).data || []);
      }

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

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome, {profile?.full_name || user?.email?.split("@")[0]}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {profile?.designation} {profile?.organisation ? `at ${profile.organisation}` : ""}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Profile + Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ClayCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Profile</h3>
                  <p className="text-xs text-slate-400">iGOT synced</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <InfoRow label="Name" value={profile?.full_name} />
                <InfoRow label="Email" value={profile?.email} />
                <InfoRow label="Level" value={profile?.government_level} capitalize />
                {profile?.ministry && <InfoRow label="Ministry" value={profile.ministry} />}
                {profile?.state && <InfoRow label="State" value={profile.state} />}
                <InfoRow label="Organisation" value={profile?.organisation} />
                <InfoRow label="Designation" value={profile?.designation} />
                {profile?.job_role && <InfoRow label="Job Role" value={profile.job_role} />}
                {profile?.education_level && (
                  <InfoRow label="Education" value={profile.education_level.replace(/_/g, " ")} />
                )}
                {profile?.years_of_experience != null && (
                  <InfoRow label="Experience" value={`${profile.years_of_experience} years`} />
                )}
              </div>
            </ClayCard>

            {/* Quick Actions */}
            <ClayCard className="p-6">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ActionLink
                  icon={<BarChart3 size={16} />}
                  label="Take Skill Assessment"
                  href="/assessment"
                />
                <ActionLink
                  icon={<BookOpen size={16} />}
                  label="Browse Courses"
                  href="/courses"
                />
                <ActionLink
                  icon={<Calendar size={16} />}
                  label="Training Calendar"
                  href="#tpac"
                />
              </div>
            </ClayCard>
          </div>

          {/* Right column — Courses + TPAC */}
          <div className="lg:col-span-2 space-y-6">
            {/* iGOT Courses */}
            <ClayCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary-600" />
                  <h3 className="font-semibold text-slate-800">iGOT Karmayogi Courses</h3>
                </div>
                <a href="/courses" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  View All →
                </a>
              </div>
              {igotCourses.length === 0 ? (
                <p className="text-slate-400 text-sm">No courses synced yet.</p>
              ) : (
                <div className="space-y-3">
                  {igotCourses.slice(0, 5).map((course) => (
                    <div
                      key={course.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <BookOpen size={14} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-slate-100">
                            {course.source}
                          </span>
                          {course.duration_hours && (
                            <span className="text-[10px] text-slate-400">
                              {course.duration_hours}h
                            </span>
                          )}
                        </div>
                      </div>
                      {course.external_url && (
                        <a
                          href={course.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-slate-400 hover:text-primary-500 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ClayCard>

            {/* NSSTA TPAC Sessions */}
            <ClayCard className="p-6" id="tpac">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-cyan-600" />
                  <h3 className="font-semibold text-slate-800">NSSTA TPAC Training</h3>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                  {tpacSessions.length} upcoming
                </span>
              </div>
              {tpacSessions.length === 0 ? (
                <p className="text-slate-400 text-sm">No upcoming sessions.</p>
              ) : (
                <div className="space-y-3">
                  {tpacSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {session.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {session.location}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] uppercase tracking-wider bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg font-medium">
                          {session.training_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">
                          {new Date(session.start_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {session.end_date &&
                            ` — ${new Date(session.end_date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}`}
                        </span>
                      </div>
                      {session.competencies && session.competencies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.competencies.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-100"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ClayCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`text-slate-700 font-medium text-right max-w-[60%] truncate ${capitalize ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ActionLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors no-underline group"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
        <span className="text-slate-500 group-hover:text-primary-600 transition-colors">
          {icon}
        </span>
      </div>
      <span className="text-sm text-slate-600 font-medium flex-1">{label}</span>
      <ArrowRight size={14} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
    </a>
  );
}
