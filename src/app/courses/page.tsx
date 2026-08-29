"use client";
/**
 * Courses Page — lists all available courses from the backend.
 *
 * Fetches from GET /api/courses (server-side, respects RLS).
 * Supports filtering by source (igot, nssta_tpac, internal) and search.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { ClayCard } from "@/components/ui";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  ExternalLink,
  Loader2,
  ChevronRight,
  GraduationCap,
  Building2,
  Globe,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  external_url: string;
  is_active: boolean;
}

const SOURCE_FILTERS = [
  { value: "", label: "All Courses", icon: Globe },
  { value: "igot", label: "iGOT Karmayogi", icon: BookOpen },
  { value: "internal", label: "SkillUp Internal", icon: GraduationCap },
];

const SOURCE_COLORS: Record<string, string> = {
  igot: "bg-blue-50 text-blue-700 border-blue-100",

  internal: "bg-purple-50 text-purple-700 border-purple-100",
};

const SOURCE_LABELS: Record<string, string> = {
  igot: "iGOT",

  internal: "Internal",
};

export default function CoursesPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCourses();
  }, [sourceFilter, page]);

  async function loadCourses() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (sourceFilter) params.set("source", sourceFilter);
      if (search) params.set("search", search);

      const resp = await fetch(`/api/courses?${params}`);
      if (!resp.ok) throw new Error("Failed to fetch");
      const data = await resp.json();

      setCourses(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load courses:", err);
      // Fallback: try Supabase directly
      try {
        let query = supabase
          .from("courses")
          .select("*")
          .eq("is_active", true)
          .order("title", { ascending: true })
          .range(0, 19);

        if (sourceFilter) query = query.eq("source", sourceFilter);
        if (search) query = query.ilike("title", `%${search}%`);

        const { data } = await query;
        if (data) {
          setCourses(data as Course[]);
          setTotalPages(1);
        }
      } catch {
        // silent fallback
      }
    }
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadCourses();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Course Catalogue
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse courses from iGOT Karmayogi and SkillUp
            internal library
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </form>
          <div className="flex gap-2 flex-wrap">
            {SOURCE_FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setSourceFilter(f.value);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    sourceFilter === f.value
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : courses.length === 0 ? (
          <ClayCard className="p-12 text-center">
            <BookOpen
              size={40}
              className="mx-auto text-slate-300 mb-4"
            />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No courses found
            </h3>
            <p className="text-slate-400 text-sm">
              {search
                ? "Try a different search term"
                : "Courses will appear here once the database is seeded"}
            </p>
          </ClayCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <ClayCard key={course.id} className="p-5 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-lg border ${
                        SOURCE_COLORS[course.source] || "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {SOURCE_LABELS[course.source] || course.source}
                    </span>
                    {course.duration_hours && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} />
                        {course.duration_hours}h
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                    >
                      View Details
                      <ChevronRight size={12} />
                    </button>
                    {course.external_url && (
                      <a
                        href={course.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-primary-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={10} />
                        Original
                      </a>
                    )}
                  </div>
                </ClayCard>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
