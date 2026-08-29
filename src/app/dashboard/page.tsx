"use client";
/**
 * Dashboard — main authenticated user page.
 *
 * Shows:
 * 1. Profile summary with gamification stats
 * 2. Available iGOT courses
 * 3. Skill heatmap preview
 * 4. Quick links to competency assessment
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { supabase } from "@/lib/supabaseClient";
import { ClayCard } from "@/components/ui";
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

      // Fetch courses — try backend API, then iGOT directly
      try {
        const coursesResp = await fetch("/api/courses?limit=10");
        if (coursesResp.ok) {
          const coursesData = await coursesResp.json();
          if (coursesData.data && coursesData.data.length > 0) {
            setIgotCourses(coursesData.data as IGOTCourse[]);
          } else {
            throw new Error('empty');
          }
        } else {
          throw new Error('failed');
        }
      } catch {
        // Fallback: fetch directly from iGOT API
        try {
          const IGOT_IDS = [
            'do_113923174474121216195', 'do_1141533540853432321675',
            'do_1143166853070028801812', 'do_1143052789530787841562',
            'do_113569878939262976132',
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
                description: (c.description || '').replace(/<[^>]*>/g, '').substring(0, 200),
                source: 'igot',
                duration_hours: Math.round((parseInt(c.duration || '0') / 3600) * 10) / 10 || 0.5,
                external_url: `https://portal.igotkarmayogi.gov.in/public/toc/${c.identifier || id}/overview`,
              };
            })
          );
          const fetched = results
            .filter((r): r is PromiseFulfilledResult<IGOTCourse> => r.status === 'fulfilled' && r.value !== null)
            .map((r) => r.value);
          if (fetched.length > 0) setIgotCourses(fetched);
        } catch {
          // silent
        }
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
                  label="Browse All Courses"
                  href="/courses"
                />
                <ActionLink
                  icon={<BarChart3 size={16} />}
                  label="Skill Heatmap"
                  href="/dashboard/heatmap"
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
