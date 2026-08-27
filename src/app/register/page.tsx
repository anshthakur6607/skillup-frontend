"use client";
/**
 * RegisterPage — create account with email/password and Google OAuth.
 * Includes resend verification email functionality.
 */
import { useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard, FloatingShape } from "@/components/ui";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithOAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const validate = (): string | null => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/\d/.test(password))
      return "Password must contain at least one number.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const ve = validate();
    if (ve) {
      setError(ve);
      return;
    }
    setLoading(true);
    const { error: ae } = await signUp(email.trim(), password, fullName.trim());
    if (ae) {
      // Check if user already exists (Supabase returns this error)
      if (ae.message.includes("already registered") || ae.message.includes("already been registered")) {
        setError(
          "An account with this email already exists. Please sign in instead."
        );
      } else if (ae.message.includes("rate")) {
        setError("Too many attempts. Please wait a moment.");
      } else {
        setError("Could not create account. Please try again.");
      }
      setLoading(false);
      return;
    }
    setEmailSent(true);
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    const { error: ae } = await signInWithOAuth("google");
    if (ae) setError("Could not start Google sign-up. Please try again.");
  };

  const handleResendVerification = useCallback(async () => {
    if (!email.trim()) return;
    setResending(true);
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setResendMessage("Too many requests. Please wait 10 minutes.");
      } else {
        setResendMessage(
          data.message || "If that email is registered, a verification link has been sent."
        );
      }
    } catch {
      setResendMessage("Could not send verification email. Please try again.");
    } finally {
      setResending(false);
    }
  }, [email]);

  if (emailSent) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <FloatingShape
          animation="animate-float-1"
          size={250}
          top="10%"
          left="5%"
          color="linear-gradient(135deg, #3b82f6, #22d3ee)"
          opacity={0.1}
        />
        <ClayCard className="p-8 text-center max-w-md relative z-10">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Check your email
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            We sent a confirmation link to{" "}
            <strong className="text-slate-700">{email}</strong>. Click the link
            to verify your account.
          </p>

          {resendMessage && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              {resendMessage}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full py-3 bg-white text-slate-600 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {resending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {resending ? "Sending..." : "Resend verification email"}
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium no-underline hover:bg-slate-800 transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-slate-800">SkillUp</span>
          </Link>
        </div>

        <ClayCard className="p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Create your account
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Start your learning journey
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fn"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="fn"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm"
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="em"
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
                  id="em"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="pw"
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
                  id="pw"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm"
                  placeholder="Min 8 chars, 1 number"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="cpw"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="cpw"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm"
                  placeholder="Re-enter password"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google OAuth — only enabled provider */}
          <button
            onClick={handleGoogleSignUp}
            className="w-full py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-3 text-sm"
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
        </ClayCard>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-500 hover:text-primary-600 font-medium no-underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
