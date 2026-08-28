"use client";
/**
 * Course Detail Page — view course info, enroll, start, and monitor auto-completion.
 *
 * Dummy monitoring system:
 * - When user clicks "Start Course", we POST to /api/courses/:id/start
 * - The server sets started_at = now
 * - This page polls GET /api/courses/:id/progress every 1 second
 * - The server computes progress based on elapsed time vs course duration
 *   (compressed for demo: short courses complete in 10s, medium in 30s, long in 60s)
 * - When progress hits 100%, the server marks the course as completed
 *   and generates a certificate automatically
 * - The UI shows a live progress bar and countdown timer
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";
import {
  BookOpen,
  ArrowLeft,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Play,
  Award,
  RefreshCw,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  external_url: string;
  is_active: boolean;
  course_competencies?: Array<{
    competencies: { id: string; name: string; description: string } | null;
  }>;
}

interface Enrollment {
  id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
}

interface ProgressData {
  data: Enrollment | null;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = (params?.id as string) || "";
  const { session, user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [starting, setStarting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch course details
  useEffect(() => {
    loadCourse();
  }, [courseId]);

  // Poll progress when in_progress
  useEffect(() => {
    if (enrollment?.status !== "in_progress") return;

    pollProgress();
    pollRef.current = setInterval(pollProgress, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enrollment?.status]);

  async function loadCourse() {
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const resp = await fetch(`/api/courses/${courseId}`, { headers });
      if (!resp.ok) throw new Error("Course not found");
      const data = await resp.json();

      setCourse(data.data);
      if (data.enrollment) {
        setEnrollment(data.enrollment);
        if (data.enrollment.status === "completed") {
          setProgress(100);
          setCompleted(true);
        }
      }
    } catch (err) {
      console.error("Failed to load course:", err);
    }
    setLoading(false);
  }

  async function pollProgress() {
    if (!session?.access_token) return;

    try {
      const resp = await fetch(`/api/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!resp.ok) return;

      const data: ProgressData = await resp.json();
      if (!data.data) return;

      setEnrollment(data.data);
      setProgress(data.data.progress_percent || 0);

      if (data.data.status === "completed") {
        setCompleted(true);
        if (pollRef.current) clearInterval(pollRef.current);
      }

      // Calculate time left
      if (data.data.started_at && data.data.status !== "completed") {
        const elapsed = Date.now() - new Date(data.data.started_at).getTime();
        const durationHrs = course?.duration_hours || 4;
        let targetSeconds: number;
        if (durationHrs <= 2) targetSeconds = 10;
        else if (durationHrs <= 8) targetSeconds = 30;
        else targetSeconds = 60;

        const remaining = Math.max(0, targetSeconds - elapsed / 1000);
        setTimeLeft(Math.round(remaining));
      }
    } catch {
      // silent
    }
  }

  async function handleEnroll() {
    if (!session?.access_token) {
      router.push("/login");
      return;
    }
    setEnrolling(true);
    try {
      const resp = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error("Failed to enroll");
      const data = await resp.json();
      setEnrollment(data.data);
    } catch (err) {
      console.error("Enroll failed:", err);
    }
    setEnrolling(false);
  }

  async function handleStart() {
    if (!session?.access_token) return;
    setStarting(true);
    try {
      const resp = await fetch(`/api/courses/${courseId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error("Failed to start");
      const data = await resp.json();
      setEnrollment(data.data);
    } catch (err) {
      console.error("Start failed:", err);
    }
    setStarting(false);
  }

  function formatTime(seconds: number): string {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }

  // Get competencies from course
  const competencies = (course?.course_competencies || [])
    .map((cc) => cc.competencies)
    .filter(Boolean) as Array<{ id: string; name: string; description: string }>;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-700">
            Course not found
          </h2>
          <button
            onClick={() => router.push("/courses")}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.push("/courses")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to courses
        </button>

        {/* Course Info */}
        <ClayCard className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                {course.source === "igot"
                  ? "iGOT Karmayogi"
                  : course.source === "nssta_tpac"
                  ? "NSSTA TPAC"
                  : "Internal"}
              </span>
              <h1 className="text-xl font-bold text-slate-800 mt-3">
                {course.title}
              </h1>
            </div>
            {course.duration_hours && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Clock size={14} />
                {course.duration_hours}h
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {course.description}
          </p>

          {course.external_url && (
            <a
              href={course.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary-600 hover:text-primary-700"
            >
              <ExternalLink size={14} />
              View on original platform
            </a>
          )}
        </ClayCard>

        {/* Competencies */}
        {competencies.length > 0 && (
          <ClayCard className="p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Skills You&apos;ll Build
            </h3>
            <div className="flex flex-wrap gap-2">
              {competencies.map((c) => (
                <span
                  key={c.id}
                  className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-xl border border-primary-100"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </ClayCard>
        )}

        {/* Progress / Action Card */}
        <ClayCard className="p-6">
          {completed || enrollment?.status === "completed" ? (
            /* ─── COMPLETED STATE ─── */
            <div className="text-center">
              <CheckCircle2
                size={48}
                className="mx-auto text-green-500 mb-4"
              />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Course Completed
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Congratulations! You&apos;ve finished this course.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                <Award size={16} />
                Certificate generated
              </div>
            </div>
          ) : enrollment?.status === "in_progress" ? (
            /* ─── IN PROGRESS STATE ─── */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">
                  Course In Progress
                </h3>
                <span className="text-sm font-mono text-primary-600">
                  {progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {progress < 100
                    ? "Auto-completing based on course duration..."
                    : "Finalizing..."}
                </span>
                {timeLeft > 0 && progress < 100 && (
                  <span className="font-mono">
                    ~{formatTime(timeLeft)} remaining
                  </span>
                )}
              </div>

              {progress >= 100 && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600">
                  <CheckCircle2 size={16} />
                  Course complete — generating certificate...
                </div>
              )}
            </div>
          ) : (
            /* ─── NOT STARTED / ENROLL STATE ─── */
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                {enrollment ? "Ready to Start" : "Enroll in this Course"}
              </h3>

              {!enrollment ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !session}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {enrolling ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <BookOpen size={16} />
                  )}
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-4">
                    Once you start, the course will auto-complete based on its
                    duration ({course.duration_hours || "varies"} hours).
                  </p>
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 text-white text-sm font-semibold hover:from-primary-600 hover:to-cyan-600 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {starting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )}
                    {starting ? "Starting..." : "Start Course"}
                  </button>
                </>
              )}

              {!session && (
                <p className="text-xs text-slate-400 text-center mt-3">
                  <button
                    onClick={() => router.push("/login")}
                    className="text-primary-600 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>{" "}
                  to enroll in courses
                </p>
              )}
            </div>
          )}
        </ClayCard>
      </div>
    </div>
  );
}
