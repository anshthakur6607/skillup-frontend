"use client";

/**
 * My Learning — shows enrolled courses with progress, status tabs.
 * Inspired by iGOT Karmayogi "My Learning" section.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  Filter,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface EnrolledCourse {
  id: string;
  course_id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  status: string;
  progress_percent: number;
  enrolled_at: string;
  completed_at: string | null;
}

type TabType = "all" | "in_progress" | "completed" | "not_started";

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "not_started", label: "Not Started" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function MyLearningPage() {
  const { session } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const fetchEnrollments = async () => {
      try {
        const res = await fetch("/api/dashboard/enrollments", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.status === "ok") {
          setCourses(data.data || []);
        }
      } catch {
        // Use empty array
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [session]);

  const filtered =
    activeTab === "all"
      ? courses
      : courses.filter((c) => c.status === activeTab);

  const tabCounts = {
    all: courses.length,
    in_progress: courses.filter((c) => c.status === "in_progress").length,
    completed: courses.filter((c) => c.status === "completed").length,
    not_started: courses.filter((c) => c.status === "not_started").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Learning</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your enrolled courses and progress
          </p>
        </div>
        <Link
          href="/dashboard/learn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl text-sm font-semibold no-underline hover:shadow-lg transition-all"
        >
          <BookOpen size={16} />
          Browse Courses
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer border-none transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-primary-500 to-cyan-400 text-white shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]"
                : "bg-white text-slate-600 hover:bg-slate-50 shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tabCounts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Course List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : filtered.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-3"
        >
          {filtered.map((course) => (
            <motion.div key={course.id} variants={fadeUp}>
              <ClayCard className="p-4 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center shrink-0 group-hover:from-primary-200 group-hover:to-cyan-200 transition-colors">
                    {course.status === "completed" ? (
                      <CheckCircle2 size={22} className="text-emerald-500" />
                    ) : course.status === "in_progress" ? (
                      <Play size={22} className="text-primary-500" />
                    ) : (
                      <BookOpen size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {course.source} • {course.duration_hours}h
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            course.status === "completed"
                              ? "bg-emerald-50 text-emerald-600"
                              : course.status === "in_progress"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {course.status === "in_progress"
                            ? "In Progress"
                            : course.status === "completed"
                            ? "Completed"
                            : "Not Started"}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-slate-700">
                          {Math.round(course.progress_percent)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            course.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-primary-500 to-cyan-400"
                          }`}
                          style={{ width: `${Math.max(course.progress_percent, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ClayCard>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <ClayCard className="p-12 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No courses {activeTab === "all" ? "enrolled" : activeTab.replace("_", " ")}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {activeTab === "all"
              ? "Start learning by enrolling in a course."
              : "Try a different filter."}
          </p>
          <Link
            href="/dashboard/learn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl text-sm font-semibold no-underline"
          >
            Browse Courses <ArrowRight size={14} />
          </Link>
        </ClayCard>
      )}
    </div>
  );
}
