"use client";

/**
 * Learn Hub — fetches courses directly from iGOT's public content API.
 * No backend dependency — works even if backend is not deployed.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Filter,
  ArrowRight,
  Loader2,
  Globe,
  ExternalLink,
  AlertCircle,
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
      duration_hours:
        Math.round((parseInt(c.duration || "0") / 3600) * 10) / 10 || 0.5,
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

export default function LearnHubPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Try backend API first
        const resp = await fetch("/api/courses?limit=50");
        if (resp.ok) {
          const data = await resp.json();
          if (data.data && data.data.length > 0) {
            setCourses(data.data);
            setFiltered(data.data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // backend not available, fetch from iGOT directly
      }

      // Fetch directly from iGOT content API
      const results = await Promise.allSettled(
        IGOT_COURSE_IDS.map((id) => fetchIGOTCourse(id))
      );

      const fetched = results
        .filter(
          (r): r is PromiseFulfilledResult<Course> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);

      if (fetched.length > 0) {
        setCourses(fetched);
        setFiltered(fetched);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    fetchAll();
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...courses];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [courses, search]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  function formatDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours}h`;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Learn Hub</h1>
        <p className="text-slate-500 text-sm mt-1">
          Explore courses from iGOT Karmayogi to build your competencies
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {loading
          ? "Loading courses from iGOT Karmayogi..."
          : `${filtered.length} courses found`}
      </p>

      {/* Course Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={28} className="animate-spin text-primary-500" />
          <p className="text-sm text-slate-400">
            Fetching courses from iGOT Karmayogi...
          </p>
        </div>
      ) : error ? (
        <ClayCard className="p-12 text-center">
          <AlertCircle size={36} className="mx-auto text-amber-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            Could not load courses
          </h3>
          <p className="text-sm text-slate-500">
            Check your internet connection and try again.
          </p>
        </ClayCard>
      ) : filtered.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((course) => (
            <motion.div key={course.id} variants={fadeUp}>
              <div
                onClick={() => router.push(`/courses/${course.id}`)}
                className="cursor-pointer h-full"
              >
                <ClayCard className="p-5 h-full flex flex-col group hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center shrink-0 group-hover:from-primary-200 group-hover:to-cyan-200 transition-colors">
                      <BookOpen size={20} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                        {course.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium inline-block mt-1">
                        iGOT Karmayogi
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 flex-1">
                    {course.description || "No description available."}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
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
                      View <ArrowRight size={12} />
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
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No courses found
          </h3>
          <p className="text-sm text-slate-500">
            {search ? "Try a different search term" : "No courses available"}
          </p>
        </ClayCard>
      )}
    </div>
  );
}
