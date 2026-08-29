"use client";
/**
 * Assessment Page — adaptive MCQ assessment for course completion.
 *
 * Features:
 * - Shows current difficulty level (beginner/intermediate/advanced)
 * - Adaptive difficulty: adjusts based on performance
 * - Visual feedback after each answer (correct/wrong + explanation)
 * - Final score and certificate on completion
 * - Uses AI-generated questions (Gemini/Sarvam with fallback)
 */
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard, FloatingShape } from "@/components/ui";
import { authPost, authGet } from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  BarChart3,
  BookOpen,
  Target,
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  difficulty: string;
  competency: string;
  bloomLevel?: string;
}

interface AssessmentState {
  currentDifficulty: string;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  questionsAnswered: number;
  totalCorrect: number;
  totalQuestions: number;
}

interface AssessmentResult {
  completed: boolean;
  score: number;
  passed: boolean;
  totalCorrect: number;
  totalQuestions: number;
  passThreshold: number;
  wasCorrect?: boolean;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  beginner: { bg: "bg-green-100", text: "text-green-700", label: "Beginner" },
  intermediate: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Intermediate" },
  advanced: { bg: "bg-red-100", text: "text-red-700", label: "Advanced" },
};

const BLOOM_LABELS: Record<string, { label: string; color: string }> = {
  remember: { label: "Recall", color: "bg-blue-100 text-blue-700" },
  understand: { label: "Understand", color: "bg-indigo-100 text-indigo-700" },
  apply: { label: "Apply", color: "bg-purple-100 text-purple-700" },
  analyze: { label: "Analyze", color: "bg-pink-100 text-pink-700" },
  evaluate: { label: "Evaluate", color: "bg-amber-100 text-amber-700" },
  create: { label: "Create", color: "bg-red-100 text-red-700" },
};

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 size={32} className="animate-spin text-primary-500" /></div>}>
      <AssessmentContent />
    </Suspense>
  );
}

function AssessmentContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams?.get("courseId");
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [state, setState] = useState<AssessmentState | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [error, setError] = useState("");

  // Start assessment
  const startAssessment = useCallback(async () => {
    if (!session?.access_token || !courseId) return;
    setLoading(true);
    setError("");
    try {
      const resp = await authPost("/api/assessments/start", session.access_token, { courseId });
      if (resp.error) { setError(resp.error); setLoading(false); return; }
      const data = (resp.data as Record<string, unknown>)?.data as Record<string, unknown>;
      setAttemptId(data.attemptId as string);
      setQuestion(data.question as Question);
      setState(data.state as AssessmentState);
      setCourseTitle(data.courseTitle as string);
    } catch {
      setError("Failed to start assessment. Please try again.");
    }
    setLoading(false);
  }, [session, courseId]);

  useEffect(() => { startAssessment(); }, [startAssessment]);

  // Submit answer
  const submitAnswer = async (selected: string) => {
    if (!session?.access_token || !attemptId || !question || !state || submitting) return;
    setSubmitting(true);
    setSelectedOption(selected);

    // Find correct answer (we need to get it from the question state)
    // In a real app, the correct answer would be hidden until submission
    // For now, we send it to the backend for verification
    try {
      const resp = await authPost("/api/assessments/answer", session.access_token, {
        attemptId,
        selectedAnswer: selected,
        correctAnswer: question.options[0], // Backend verifies this
        difficulty: question.difficulty,
        state,
      });

      if (resp.error) { setError(resp.error); setSubmitting(false); return; }

      const data = (resp.data as Record<string, unknown>)?.data as Record<string, unknown>;

      if (data.completed) {
        // Assessment complete
        setResult(data as unknown as AssessmentResult);
      } else {
        // Show feedback, then next question
        const wasCorrect = data.wasCorrect as boolean;
        setFeedback({
          correct: wasCorrect,
          explanation: wasCorrect ? "Correct! Well done." : "Not quite. Let's continue.",
        });

        // After 2 seconds, show next question
        setTimeout(() => {
          setQuestion(data.nextQuestion as Question);
          setState(data.state as AssessmentState);
          setSelectedOption(null);
          setFeedback(null);
        }, 2000);
      }
    } catch {
      setError("Failed to submit answer. Please try again.");
    }
    setSubmitting(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-500">Generating your assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !question) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <ClayCard className="p-8 max-w-md text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Assessment Error</h2>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={startAssessment}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold text-sm cursor-pointer border-none"
          >
            Try Again
          </button>
        </ClayCard>
      </div>
    );
  }

  // Result state
  if (result) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <FloatingShape animation="animate-float-1" size={250} top="10%" left="5%" color="linear-gradient(135deg, #3b82f6, #22d3ee)" opacity={0.1} />
        <ClayCard className="p-8 max-w-md w-full text-center relative z-10">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${result.passed ? "bg-green-100" : "bg-red-100"}`}>
            {result.passed ? (
              <Trophy size={40} className="text-green-600" />
            ) : (
              <XCircle size={40} className="text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {result.passed ? "Assessment Passed!" : "Assessment Not Passed"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">{courseTitle}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{result.score}%</p>
              <p className="text-xs text-slate-400">Score</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{result.totalCorrect}/{result.totalQuestions}</p>
              <p className="text-xs text-slate-400">Correct</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-2xl font-bold text-slate-800">{result.passThreshold}%</p>
              <p className="text-xs text-slate-400">Required</p>
            </div>
          </div>

          {result.passed && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 mb-6">
              <p className="text-green-700 text-sm font-medium">
                Certificate generated! Check your dashboard.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold text-sm text-center no-underline"
            >
              Back to Dashboard
            </a>
            {!result.passed && (
              <button
                onClick={startAssessment}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl font-semibold text-sm border border-slate-200 cursor-pointer"
              >
                <RotateCcw size={14} />
                Retry
              </button>
            )}
          </div>
        </ClayCard>
      </div>
    );
  }

  // Question state
  const diffStyle = DIFFICULTY_COLORS[question?.difficulty || "intermediate"] || DIFFICULTY_COLORS.intermediate;
  const progress = state ? (state.questionsAnswered / state.totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <FloatingShape animation="animate-float-1" size={250} top="10%" left="5%" color="linear-gradient(135deg, #3b82f6, #22d3ee)" opacity={0.1} />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">{courseTitle}</h1>
          <p className="text-slate-500 text-sm mt-1">Course Assessment</p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Question {state?.questionsAnswered || 1} of {state?.totalQuestions || 5}</span>
            <span>{state?.totalCorrect || 0} correct</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Difficulty + Bloom's indicator */}
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400">Difficulty:</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffStyle.bg} ${diffStyle.text}`}>
              {diffStyle.label}
            </span>
          </div>
          {question?.bloomLevel && BLOOM_LABELS[question.bloomLevel] && (
            <div className="flex items-center gap-1.5">
              <Target size={12} className="text-slate-400" />
              <span className="text-xs text-slate-400">Thinking:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BLOOM_LABELS[question.bloomLevel].color}`}>
                {BLOOM_LABELS[question.bloomLevel].label}
              </span>
            </div>
          )}
        </div>

        {/* Question card */}
        <ClayCard className="p-6 mb-4">
          {feedback ? (
            <div className="text-center py-4">
              {feedback.correct ? (
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              ) : (
                <XCircle size={48} className="text-red-400 mx-auto mb-3" />
              )}
              <p className={`text-lg font-bold ${feedback?.correct ? "text-green-700" : "text-red-600"}`}>
                {feedback?.correct ? "Correct!" : "Not Quite"}
              </p>
              <p className="text-slate-500 text-sm mt-2">{feedback.explanation}</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 mb-4">
                <BookOpen size={16} className="text-primary-500 mt-0.5 shrink-0" />
                <p className="text-slate-800 font-medium">{question?.text}</p>
              </div>

              <div className="space-y-2">
                {question?.options.map((option, idx) => {
                  const isSelected = selectedOption === option;

                  return (
                    <button
                      key={idx}
                      onClick={() => !submitting && submitAnswer(option)}
                      disabled={submitting}
                      className={`w-full text-left p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary-300 bg-primary-50 text-primary-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-slate-50"
                      } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="font-medium text-slate-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </ClayCard>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        {state && (
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>Streak: {state.consecutiveCorrect > 0 ? `${state.consecutiveCorrect} correct` : `${state.consecutiveWrong} wrong`}</span>
          </div>
        )}
      </div>
    </div>
  );
}
