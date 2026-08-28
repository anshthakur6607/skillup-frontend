"use client";
/**
 * Course Detail Page — full course view with tabs.
 *
 * Tabs:
 * 1. Overview — description, objectives, metadata
 * 2. Modules — list of modules/videos from iGOT
 * 3. Study Materials — resources and documents
 * 4. Assessments — quizzes and tests
 * 5. Tasks — assignments and activities
 *
 * Also handles enroll, start, and auto-completion monitoring.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";
import { CourseChatbot } from "@/components/chatbot/CourseChatbot";
import {
  BookOpen,
  ArrowLeft,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Play,
  Award,
  FileText,
  Video,
  ClipboardCheck,
  ListChecks,
  Target,
  BarChart3,
  Users,
  Tag,
} from "lucide-react";

interface Module {
  id: string;
  name: string;
  type: "video" | "assessment" | "module" | "resource";
  index: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  source: string;
  duration_hours: number;
  external_url: string;
  is_active: boolean;
  difficulty: string;
  creator: string;
  organisation: string;
  keywords: string[];
  instructions: string;
  modules: Module[];
  module_count: number;
  poster_image: string;
  app_icon: string;
}

interface Enrollment {
  id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
}

type TabId = "overview" | "modules" | "materials" | "assessments" | "tasks";

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Overview", icon: <FileText size={14} /> },
  { id: "modules", label: "Modules", icon: <Video size={14} /> },
  { id: "materials", label: "Study Materials", icon: <BookOpen size={14} /> },
  { id: "assessments", label: "Assessments", icon: <ClipboardCheck size={14} /> },
  { id: "tasks", label: "Tasks", icon: <ListChecks size={14} /> },
];

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = (params?.id as string) || "";
  const { session } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [starting, setStarting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (enrollment?.status !== "in_progress") return;
    pollProgress();
    pollRef.current = setInterval(pollProgress, 1000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enrollment?.status]);

  async function loadCourse() {
    // Try backend API first
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const resp = await fetch(`/api/courses/${courseId}`, { headers });
      if (resp.ok) {
        const data = await resp.json();
        if (data.data) {
          setCourse(data.data);
          if (data.enrollment) {
            setEnrollment(data.enrollment);
            if (data.enrollment.status === "completed") {
              setProgress(100);
              setCompleted(true);
            }
          }
          setLoading(false);
          return;
        }
      }
    } catch {
      // backend not available, fetch from iGOT directly
    }

    // Fetch directly from iGOT content API
    try {
      const resp = await fetch(
        `https://igotkarmayogi.gov.in/api/content/v1/read/${courseId}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!resp.ok) throw new Error("Course not found");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any = await resp.json();
      const c = raw?.result?.content;
      if (!c) throw new Error("Course not found");

      const stripHtml = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

      // Fetch module names
      const modIds: string[] = c.childNodes || [];
      const modules: Array<{ id: string; name: string; type: string; index: number }> = [];
      for (let i = 0; i < modIds.length; i += 5) {
        const batch = modIds.slice(i, i + 5);
        const results = await Promise.allSettled(
          batch.map(async (nid) => {
            try {
              const r = await fetch(`https://igotkarmayogi.gov.in/api/content/v1/read/${nid}`, { signal: AbortSignal.timeout(5000) });
              if (!r.ok) return null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const d: any = await r.json();
              const m = d?.result?.content;
              if (!m) return null;
              return {
                id: m.identifier || nid,
                name: m.name || 'Untitled',
                type: m.mimeType?.includes('video') ? 'video' : m.mimeType?.includes('quiz') || m.mimeType?.includes('question') ? 'assessment' : m.primaryCategory === 'CourseUnit' ? 'module' : 'resource',
                index: i + batch.indexOf(nid),
              };
            } catch { return null; }
          })
        );
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value) modules.push(r.value);
        }
      }
      modules.sort((a, b) => a.index - b.index);
      const typedModules = modules as unknown as Module[];

      setCourse({
        id: c.identifier || courseId,
        title: c.name || 'Untitled Course',
        description: stripHtml(c.description || ''),
        source: 'igot',
        duration_hours: Math.round((parseInt(c.duration || '0') / 3600) * 10) / 10 || 0.5,
        external_url: `https://portal.igotkarmayogi.gov.in/public/toc/${c.identifier || courseId}/overview`,
        is_active: true,
        difficulty: c.difficultyLevel || 'Beginner',
        creator: c.creator || '',
        organisation: c.organisation?.[0] || '',
        keywords: c.keywords?.slice(0, 10) || [],
        instructions: stripHtml(c.instructions || ''),
        modules: typedModules,
        module_count: typedModules.length,
        poster_image: c.posterImage || '',
        app_icon: c.appIcon || '',
      });
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
      const data = await resp.json();
      if (!data.data) return;
      setEnrollment(data.data);
      setProgress(data.data.progress_percent || 0);
      if (data.data.status === "completed") {
        setCompleted(true);
        if (pollRef.current) clearInterval(pollRef.current);
      }
      if (data.data.started_at && data.data.status !== "completed") {
        const elapsed = Date.now() - new Date(data.data.started_at).getTime();
        const dur = course?.duration_hours || 1;
        let targetSec: number;
        if (dur <= 0.5) targetSec = 10;
        else if (dur <= 2) targetSec = 20;
        else if (dur <= 8) targetSec = 30;
        else targetSec = 60;
        setTimeLeft(Math.max(0, Math.round(targetSec - elapsed / 1000)));
      }
    } catch {
      // silent
    }
  }

  async function handleEnroll() {
    if (!session?.access_token) { router.push("/login"); return; }
    setEnrolling(true);
    try {
      // Try backend API first
      const resp = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      });
      if (resp.ok) {
        const data = await resp.json();
        setEnrollment(data.data);
        setEnrolling(false);
        // Open iGOT course in new tab after enrolling
        if (course?.external_url) window.open(course.external_url, "_blank");
        return;
      }
    } catch {
      // backend not available
    }
    // Fallback: create local enrollment and open iGOT
    setEnrollment({
      id: "local",
      status: "not_started",
      progress_percent: 0,
      started_at: null,
      completed_at: null,
    });
    setEnrolling(false);
    if (course?.external_url) window.open(course.external_url, "_blank");
  }

  async function handleStart() {
    if (!session?.access_token) { router.push("/login"); return; }
    setStarting(true);
    try {
      const resp = await fetch(`/api/courses/${courseId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      });
      if (resp.ok) {
        const data = await resp.json();
        setEnrollment(data.data);
        setStarting(false);
        if (course?.external_url) window.open(course.external_url, "_blank");
        return;
      }
    } catch {
      // backend not available
    }
    // Fallback: mark as in progress locally and open iGOT
    setEnrollment((prev) => prev ? { ...prev, status: "in_progress", started_at: new Date().toISOString() } : prev);
    setStarting(false);
    if (course?.external_url) window.open(course.external_url, "_blank");
  }

  function formatDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours === 1) return "1 hour";
    return `${hours} hours`;
  }

  function formatTime(s: number): string {
    if (s <= 0) return "0s";
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  }

  // Split modules by type
  const videos = course?.modules?.filter((m) => m.type === "video") || [];
  const assessments = course?.modules?.filter((m) => m.type === "assessment") || [];
  const resources = course?.modules?.filter((m) => m.type === "resource" || m.type === "module") || [];

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
          <h2 className="text-lg font-semibold text-slate-700">Course not found</h2>
          <button onClick={() => router.push("/dashboard/learn")} className="mt-4 text-sm text-primary-600 hover:underline">
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-cyan-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push("/dashboard/learn")}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Learn Hub
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">
                  {course.source === "igot" ? "iGOT Karmayogi" : course.source}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                  {course.difficulty}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-3">{course.title}</h1>
              <p className="text-sm text-white/80 line-clamp-3 mb-4">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {formatDuration(course.duration_hours)}
                </span>
                <span className="flex items-center gap-1">
                  <Target size={14} /> {course.module_count} modules
                </span>
                {course.organisation && (
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {course.organisation}
                  </span>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="w-full md:w-72 shrink-0">
              <ClayCard className="p-5">
                {completed || enrollment?.status === "completed" ? (
                  <div className="text-center">
                    <CheckCircle2 size={36} className="mx-auto text-green-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-800">Completed</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mt-2">
                      <Award size={14} /> Certificate earned
                    </div>
                  </div>
                ) : enrollment?.status === "in_progress" ? (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-mono text-primary-600">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {timeLeft > 0 && progress < 100 && (
                      <p className="text-xs text-slate-500 text-center">
                        ~{formatTime(timeLeft)} remaining
                      </p>
                    )}
                    {progress >= 100 && (
                      <p className="text-xs text-green-600 text-center">Finalizing...</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!enrollment ? (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling || !session}
                        className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {enrolling ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                        {enrolling ? "Enrolling..." : "Enroll Now"}
                      </button>
                    ) : (
                      <button
                        onClick={handleStart}
                        disabled={starting}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 text-white text-sm font-semibold hover:from-primary-600 hover:to-cyan-600 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {starting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        {starting ? "Starting..." : "Start Course"}
                      </button>
                    )}
                    {!session && (
                      <p className="text-xs text-slate-400 text-center">
                        <button onClick={() => router.push("/login")} className="text-primary-600 hover:underline cursor-pointer">Sign in</button> to enroll
                      </p>
                    )}
                  </div>
                )}
              </ClayCard>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Bar */}
        <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <ClayCard className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">About this course</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
            </ClayCard>

            {course.instructions && (
              <ClayCard className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Learning Objectives</h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {course.instructions.split('•').filter(Boolean).map((obj, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <span>{obj.trim()}</span>
                    </div>
                  ))}
                </div>
              </ClayCard>
            )}

            {course.keywords?.length > 0 && (
              <ClayCard className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {course.keywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-xl border border-primary-100">
                      <Tag size={10} className="inline mr-1" />
                      {kw}
                    </span>
                  ))}
                </div>
              </ClayCard>
            )}

            {course.external_url && (
              <a
                href={course.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <ExternalLink size={14} />
                View on iGOT Karmayogi
              </a>
            )}
          </div>
        )}

        {activeTab === "modules" && (
          <ClayCard className="p-12 text-center">
            <Video size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 mb-2">
              Study materials are available within the iGOT course modules.
            </p>
            {course.external_url && (
              <a
                href={course.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                <ExternalLink size={14} />
                Open on iGOT
              </a>
            )}
          </ClayCard>
        )}

        {activeTab === "materials" && (
          <div className="space-y-3">
            {resources.length === 0 ? (
              <ClayCard className="p-12 text-center">
                <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Study materials are available within the iGOT course modules.</p>
                {course.external_url && (
                  <a
                    href={course.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink size={14} />
                    Open on iGOT
                  </a>
                )}
              </ClayCard>
            ) : (
              resources.map((r, i) => (
                <ClayCard key={r.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.name}</p>
                    <p className="text-xs text-slate-400">Resource</p>
                  </div>
                </ClayCard>
              ))
            )}
          </div>
        )}

        {activeTab === "assessments" && (
          <div className="space-y-3">
            {assessments.length === 0 ? (
              <ClayCard className="p-12 text-center">
                <ClipboardCheck size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 mb-2">
                  No separate assessments tab — quizzes are embedded within modules on iGOT.
                </p>
                <p className="text-xs text-slate-400">
                  After completing this course, take the SkillUp assessment to test your knowledge.
                </p>
                <button
                  onClick={() => router.push("/assessment")}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
                >
                  Take SkillUp Assessment
                </button>
              </ClayCard>
            ) : (
              assessments.map((a, i) => (
                <ClayCard key={a.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <ClipboardCheck size={18} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{a.name}</p>
                    <p className="text-xs text-slate-400">Quiz / Assessment</p>
                  </div>
                </ClayCard>
              ))
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <ClayCard className="p-12 text-center">
            <ListChecks size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 mb-2">
              Tasks and assignments will be available after course completion.
            </p>
            <p className="text-xs text-slate-400">
              Complete the course and assessment to unlock practical tasks.
            </p>
          </ClayCard>
        )}
      </div>

      {/* AI Chatbot */}
      <CourseChatbot
        courseId={course.id}
        courseTitle={course.title}
        courseDescription={course.description}
        courseDuration={course.duration_hours}
        courseDifficulty={course.difficulty}
        courseModules={course.modules || []}
        courseKeywords={course.keywords || []}
      />
    </div>
  );
}
