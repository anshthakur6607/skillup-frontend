"use client";

/**
 * LoginPage — email/password and Google OAuth login.
 * After login, checks profile completion and redirects accordingly:
 * - Profile incomplete → /setup-profile
 * - Profile complete → /dashboard
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard, FloatingShape } from "@/components/ui";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithOAuth, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  /**
   * After successful login, check if the user has completed their profile.
   * Redirect to /setup-profile or /dashboard accordingly.
   */
  const checkProfileAndRedirect = async (session: { access_token: string }) => {
    try {
      const res = await fetch("/api/auth/profile-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.status === "ok" && data.data?.profileComplete) {
        router.push("/dashboard");
      } else {
        router.push("/setup-profile");
      }
    } catch {
      // If we can't check profile status, default to setup-profile
      router.push("/setup-profile");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // We need to sign in and get the session to check profile status
    const { error: authError } = await signIn(email.trim(), password);
    if (authError) {
      setError(
        authError.message.includes("rate")
          ? "Too many attempts. Please wait and try again."
          : authError.message.includes("Email not confirmed")
          ? "Please verify your email before signing in. Check your inbox for the confirmation link."
          : "Invalid email or password. Please try again."
      );
      setLoading(false);
      return;
    }

    // Wait a moment for Supabase to set the session
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get the session from Supabase
    const { supabase } = await import("@/lib/supabaseClient");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      await checkProfileAndRedirect(session);
    } else {
      router.push("/setup-profile");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error: authError } = await signInWithOAuth("google");
    if (authError) setError("Could not start Google sign-in. Please try again.");
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    const { error: authError } = await resetPassword(resetEmail.trim());
    setResetLoading(false);
    if (authError) setResetMessage("Something went wrong. Please try again.");
    else setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden px-4">
      <FloatingShape
        animation="animate-float-1"
        size={250}
        top="10%"
        left="5%"
        color="linear-gradient(135deg, #3b82f6, #22d3ee)"
        opacity={0.1}
      />
      <FloatingShape
        animation="animate-float-2"
        size={200}
        bottom="20%"
        right="10%"
        color="linear-gradient(135deg, #22d3ee, #3b82f6)"
        opacity={0.08}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="SkillUp"
              className="h-10 w-10 rounded-full"
            />
            <span className="text-2xl font-bold text-slate-800">SkillUp</span>
          </Link>
        </div>

        <ClayCard className="p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!showReset ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(true);
                    setResetEmail(email);
                  }}
                  className="text-sm text-primary-500 hover:text-primary-600 cursor-pointer bg-transparent border-none"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {resetSent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <Mail size={24} className="text-green-600" />
                  </div>
                  <p className="text-slate-700 font-medium">Check your email</p>
                  <p className="text-slate-500 text-sm mt-1">
                    We sent a password reset link to {resetEmail}
                  </p>
                  <button
                    onClick={() => {
                      setShowReset(false);
                      setResetSent(false);
                    }}
                    className="mt-4 text-primary-500 hover:text-primary-600 text-sm cursor-pointer bg-transparent border-none"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <p className="text-slate-600 text-sm">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm"
                        disabled={resetLoading}
                      />
                    </div>
                  </div>
                  {resetMessage && (
                    <p className="text-red-600 text-sm">{resetMessage}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReset(false)}
                      className="flex-1 py-3 bg-white text-slate-600 font-semibold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {resetLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!showReset && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google OAuth — only enabled provider */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-white text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </ClayCard>

        {!showReset && (
          <p className="text-center mt-6 text-slate-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary-500 hover:text-primary-600 font-medium no-underline"
            >
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
