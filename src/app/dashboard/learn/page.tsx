"use client";

/**
 * Learn Hub — browse and discover courses.
 * Features search, category filters, and course cards.
 * Inspired by iGOT Karmayogi Learn Hub.
 */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Filter,
  Star,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  is_active: boolean;
}

const DOMAINS = [
  { id: "all", label: "All Courses" },
  { id: "statistical", label: "Statistical" },
  { id: "technical", label: "Technical" },
  { id: "digital", label: "Digital Governance" },
  { id: "behavioural", label: "Behavioural" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function LearnHubPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [activeDomain, setActiveDomain] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const fetchCourses = async () => {
      try {
        // Try the new courses API first (service-role, bypasses RLS)
        const res = await fetch("/api/courses?limit=50");
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setCourses(data.data);
            setFiltered(data.data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // fallback below
      }

      try {
        // Fallback to dashboard API
        const res = await fetch("/api/dashboard/courses", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.status === "ok") {
          setCourses(data.data || []);
          setFiltered(data.data || []);
        }
      } catch {
        // Use empty array
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [session]);

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
    if (activeDomain !== "all") {
      // Filter by source/domain
      result = result.filter(
        (c) => c.source?.toLowerCase() === activeDomain.toLowerCase()
      );
    }
    setFiltered(result);
  }, [courses, search, activeDomain]);

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
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDomain(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer border-none transition-all ${
                  activeDomain === d.id
                    ? "bg-gradient-to-r from-primary-500 to-cyan-400 text-white shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]"
                    : "bg-white text-slate-600 hover:bg-slate-50 shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]"
                }`}
              >
                {d.label}
              </button>
            ))}
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
              <div onClick={() => router.push(`/courses/${course.id}`)} className="cursor-pointer">
              <ClayCard className="p-5 h-full flex flex-col group hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center shrink-0 group-hover:from-primary-200 group-hover:to-cyan-200 transition-colors">
                    <BookOpen size={20} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                      {course.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium inline-block mt-1">
                      {course.source}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 flex-1">
                  {course.description || "No description available."}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {course.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400" />
                      4.{Math.floor(Math.random() * 5) + 3}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 cursor-pointer border-none bg-transparent p-0">
                    Enroll <ArrowRight size={12} />
                  </button>
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
            Try adjusting your search or filters.
          </p>
        </ClayCard>
      )}
    </div>
  );
}
