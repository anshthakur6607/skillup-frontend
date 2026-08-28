"use client";

/**
 * Learn Hub — browse and discover courses.
 * Features search, source filters, and course cards.
 * Fetches from /api/courses (public endpoint, no auth needed).
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
  Building2,
  GraduationCap,
  Globe,
  ExternalLink,
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
  { id: "all", label: "All Courses", icon: Globe },
  { id: "igot", label: "iGOT Karmayogi", icon: BookOpen },
  { id: "nssta_tpac", label: "NSSTA TPAC", icon: Building2 },
  { id: "internal", label: "Internal", icon: GraduationCap },
];

const SOURCE_COLORS: Record<string, string> = {
  igot: "bg-blue-50 text-blue-700",
  nssta_tpac: "bg-cyan-50 text-cyan-700",
  internal: "bg-purple-50 text-purple-700",
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function LearnHubPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses?limit=50");
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setCourses(data.data);
            setFiltered(data.data);
          }
        }
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
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
    if (activeSource !== "all") {
      result = result.filter(
        (c) => c.source?.toLowerCase() === activeSource.toLowerCase()
      );
    }
    setFiltered(result);
  }, [courses, search, activeSource]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Learn Hub</h1>
        <p className="text-slate-500 text-sm mt-1">
          Explore courses to build your competencies
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
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
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {SOURCE_FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveSource(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer border-none transition-all ${
                    activeSource === f.id
                      ? "bg-gradient-to-r from-primary-500 to-cyan-400 text-white shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]"
                      : "bg-white text-slate-600 hover:bg-slate-50 shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]"
                  }`}
                >
                  <Icon size={12} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {loading ? "Loading..." : `${filtered.length} courses found`}
      </p>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : filtered.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((course) => (
            <motion.div key={course.id} variants={fadeUp}>
              <div
                onClick={() => router.push(`/courses/${course.id}`)}
                className="cursor-pointer"
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
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                          SOURCE_COLORS[course.source] ||
                          "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {course.source === "igot"
                          ? "iGOT"
                          : course.source === "nssta_tpac"
                          ? "NSSTA TPAC"
                          : course.source}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 flex-1">
                    {course.description || "No description available."}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {course.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {course.duration_hours}h
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary-500 font-medium">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                    {course.external_url && (
                      <a
                        href={course.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-primary-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={10} />
                        iGOT
                      </a>
                    )}
                  </div>
                </ClayCard>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <ClayCard className="p-12 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No courses found
          </h3>
          <p className="text-sm text-slate-500">
            {search
              ? "Try a different search term"
              : "Run the seed.sql in Supabase to populate courses"}
          </p>
        </ClayCard>
      )}
    </div>
  );
}
