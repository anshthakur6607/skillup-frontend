"use client";

/**
 * Learn Hub — shows enrolled courses (from enrollments table) and available iGOT courses.
 * Two tabs: "My Learning" (enrolled/started) and "Browse All" (iGOT catalogue).
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  ArrowRight,
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  BarChart3,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  external_url: string;
  difficulty: string;
  module_count: number;
}

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  progress: number;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  course?: Course;
}

// Real iGOT Karmayogi course IDs
const IGOT_COURSE_IDS = [
  "do_113923174474121216195",
  "do_1141533540853432321675",
  "do_1143166853070028801812",
  "do_1143052789530787841562",
  "do_113569878939262976132",
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchIGOTCourse(id: string): Promise<Course | null> {
  try {
    const resp = await fetch(
      `https://igotkarmayogi.gov.in/api/content/v1/read/${id}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const c = data?.result?.content;
    if (!c) return null;
    return {
      id: c.identifier || id,
      title: c.name || "Untitled Course",
      description: stripHtml(c.description || ""),
      source: "igot",
      duration_hours: Math.round((parseInt(c.duration || "0") / 3600) * 10) / 10 || 0.5,
      external_url: `https://portal.igotkarmayogi.gov.in/public/toc/${c.identifier || id}/overview`,
      difficulty: c.difficultyLevel || "Beginner",
      module_count: c.childNodes?.length || 0,
    };
  } catch {
    return null;
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

type Tab = "learning" | "browse";

export default function LearnHubPage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("learning");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // 1. Fetch user's enrollments
      if (user && session) {
        try {
          const { data: enrollData } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", user.id)
            .order("enrolled_at", { ascending: false });

          if (enrollData && enrollData.length > 0) {
            // Fetch course details for each enrollment
            const enrollsWithCourses = await Promise.all(
              enrollData.map(async (enroll) => {
                // Try fetching from backend first
                try {
                  const resp = await fetch(`/api/courses/${enroll.course_id}`);
                  if (resp.ok) {
                    const d = await resp.json();
                    return { ...enroll, course: d.data || d };
                  }
                } catch { /* fallback */ }

                // Try iGOT API
                const igotCourse = await fetchIGOTCourse(enroll.course_id);
                if (igotCourse) return { ...enroll, course: igotCourse };

                // Fallback: minimal course info
                return {
                  ...enroll,
                  course: {
                    id: enroll.course_id,
                    title: enroll.course_id.replace("do_", "Course "),
                    description: "Course details loading...",
                    source: "igot",
                    duration_hours: 0,
                    external_url: `https://portal.igotkarmayogi.gov.in/public/toc/${enroll.course_id}/overview`,
                  },
                };
              })
            );
            setEnrollments(enrollsWithCourses);
          }
        } catch {
          // silent
        }
      }

      // 2. Fetch all available courses
      try {
        const resp = await fetch("/api/courses?limit=50");
        if (resp.ok) {
          const data = await resp.json();
          if (data.data && data.data.length > 0) {
            setAllCourses(data.data);
            setFiltered(data.data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // backend not available
      }

      // Fallback: fetch from iGOT directly
      const results = await Promise.allSettled(
        IGOT_COURSE_IDS.map((id) => fetchIGOTCourse(id))
      );
      const fetched = results
        .filter((r): r is PromiseFulfilledResult<Course> => r.status === "fulfilled" && r.value !== null)
        .map((r) => r.value);

      if (fetched.length > 0) {
        setAllCourses(fetched);
        setFiltered(fetched);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    fetchAll();
  }, [user, session]);

  const applyFilters = useCallback(() => {
    let result = [...allCourses];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [allCourses, search]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  function formatDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours}h`;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-100";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "completed":
        return t("assessment_passed") || "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  }

  const activeEnrollments = enrollments.filter((e) => e.status === "in_progress");
  const completedEnrollments = enrollments.filter((e) => e.status === "completed");
  const notStartedEnrollments = enrollments.filter((e) => e.status === "not_started");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t("learn_title")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("learn_desc")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setTab("learning")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none border-b-2 ${
            tab === "learning"
              ? "text-primary-500 border-b-primary-500"
              : "text-slate-500 border-b-transparent hover:text-slate-700"
          }`}
        >
          My Learning ({enrollments.length})
        </button>
        <button
          onClick={() => setTab("browse")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none border-b-2 ${
            tab === "browse"
              ? "text-primary-500 border-b-primary-500"
              : "text-slate-500 border-b-transparent hover:text-slate-700"
          }`}
        >
          Browse All ({allCourses.length})
        </button>
      </div>

      {/* Tab: My Learning */}
      {tab === "learning" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-primary-500" />
              <p className="text-sm text-slate-400">{t("common_loading")}</p>
            </div>
          ) : enrollments.length === 0 ? (
            <ClayCard className="p-12 text-center">
              <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No courses enrolled yet</h3>
              <p className="text-sm text-slate-500 mb-4">
                Browse available courses and enroll to start learning
              </p>
              <button
                onClick={() => setTab("browse")}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 cursor-pointer"
                style={{ borderRadius: "4px" }}
              >
                Browse Courses
              </button>
            </ClayCard>
          ) : (
            <>
              {/* Active Courses */}
              {activeEnrollments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                    In Progress ({activeEnrollments.length})
                  </h3>
                  <div className="space-y-3">
                    {activeEnrollments.map((enroll) => (
                      <EnrollmentCard key={enroll.id} enrollment={enroll} router={router} />
                    ))}
                  </div>
                </div>
              )}

              {/* Not Started */}
              {notStartedEnrollments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                    Not Started ({notStartedEnrollments.length})
                  </h3>
                  <div className="space-y-3">
                    {notStartedEnrollments.map((enroll) => (
                      <EnrollmentCard key={enroll.id} enrollment={enroll} router={router} />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedEnrollments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                    Completed ({completedEnrollments.length})
                  </h3>
                  <div className="space-y-3">
                    {completedEnrollments.map((enroll) => (
                      <EnrollmentCard key={enroll.id} enrollment={enroll} router={router} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: Browse All */}
      {tab === "browse" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("learn_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              style={{ borderRadius: "4px" }}
            />
          </div>

          <p className="text-sm text-slate-500">
            {loading ? t("learn_loading") : `${filtered.length} ${t("learn_found")}`}
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-primary-500" />
              <p className="text-sm text-slate-400">{t("learn_loading")}</p>
            </div>
          ) : error ? (
            <ClayCard className="p-12 text-center">
              <AlertCircle size={36} className="mx-auto text-amber-400 mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Could not load courses</h3>
              <p className="text-sm text-slate-500">Check your internet connection and try again.</p>
            </ClayCard>
          ) : filtered.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((course) => (
                <motion.div key={course.id} variants={fadeUp}>
                  <div
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="cursor-pointer h-full"
                  >
                    <ClayCard className="p-5 h-full flex flex-col group hover:border-primary-200 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 bg-primary-50 flex items-center justify-center shrink-0"
                          style={{ borderRadius: "4px" }}
                        >
                          <BookOpen size={18} className="text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                            {course.title}
                          </h3>
                          <span
                            className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-medium inline-block mt-1"
                            style={{ borderRadius: "4px" }}
                          >
                            iGOT Karmayogi
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 flex-1">
                        {course.description || "No description available."}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {course.duration_hours > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDuration(course.duration_hours)}
                            </span>
                          )}
                          {course.module_count > 0 && (
                            <span>{course.module_count} modules</span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary-500 group-hover:text-primary-600">
                          {t("learn_view")} <ArrowRight size={12} />
                        </span>
                      </div>
                    </ClayCard>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <ClayCard className="p-12 text-center">
              <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">{t("learn_no_courses")}</h3>
              <p className="text-sm text-slate-500">
                {search ? "Try a different search term" : "No courses available"}
              </p>
            </ClayCard>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-100";
    case "in_progress":
      return "bg-blue-50 text-blue-700 border-blue-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    default:
      return "Not Started";
  }
}

function EnrollmentCard({ enrollment, router }: { enrollment: Enrollment; router: ReturnType<typeof useRouter> }) {
  const course = enrollment.course;
  const progress = enrollment.progress || 0;
  const status = enrollment.status || "not_started";

  function formatDuration(hours: number): string {
    if (!hours) return "";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours}h`;
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <ClayCard className="p-4 hover:border-primary-200 transition-all">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 bg-primary-50 flex items-center justify-center shrink-0"
            style={{ borderRadius: "4px" }}
          >
            {status === "completed" ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : status === "in_progress" ? (
              <PlayCircle size={20} className="text-primary-500" />
            ) : (
              <BookOpen size={20} className="text-slate-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-slate-800 truncate">
                {course?.title || enrollment.course_id}
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 font-medium border ${getStatusColor(status)}`}
                style={{ borderRadius: "4px" }}
              >
                {getStatusLabel(status)}
              </span>
            </div>

            {course?.description && (
              <p className="text-xs text-slate-500 line-clamp-1 mb-2">{course.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-400">
              {course?.duration_hours ? (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatDuration(course.duration_hours)}
                </span>
              ) : null}
              <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
            </div>

            {/* Progress bar */}
            {status === "in_progress" && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 overflow-hidden" style={{ borderRadius: "4px" }}>
                    <div
                      className="h-full bg-primary-500"
                      style={{ width: `${progress}%`, borderRadius: "4px" }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {course?.external_url && (
              <a
                href={course.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-primary-500 border border-primary-200 hover:bg-primary-50 transition-colors no-underline"
                style={{ borderRadius: "4px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={10} />
                Open on iGOT
              </a>
            )}
            <button
              onClick={() => router.push(`/courses/${enrollment.course_id}`)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors cursor-pointer"
              style={{ borderRadius: "4px" }}
            >
              {status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Start"}
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </ClayCard>
    </motion.div>
  );
}
