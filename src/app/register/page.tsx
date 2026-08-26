"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/\d/.test(password)) return "Password must contain at least one number.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const ve = validate();
    if (ve) { setError(ve); return; }
    setLoading(true);
    const { error: ae } = await signUp(email.trim(), password, fullName.trim());
    if (ae) { setError(ae.message.includes("rate") ? "Too many attempts." : "Could not create account."); setLoading(false); return; }
    setEmailSent(true); setLoading(false);
  };

  if (emailSent) return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <ClayCard className="p-8 text-center max-w-md">
        <div className="text-5xl mb-4">[check email]</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
        <p className="text-slate-500 mb-4">We sent a confirmation link to <strong>{email}</strong>.</p>
        <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium no-underline">Go to Sign In</Link>
      </ClayCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <ClayCard className="p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Create account</h1>
        <p className="text-slate-500 mb-6">Start your learning journey</p>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label htmlFor="fn" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input id="fn" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" disabled={loading} /></div>
          <div><label htmlFor="em" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" disabled={loading} /></div>
          <div><label htmlFor="pw" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" placeholder="Min 8 chars, 1 number" disabled={loading} /></div>
          <div><label htmlFor="cpw" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input id="cpw" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" disabled={loading} /></div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}</button>
        </form>
      </ClayCard>
      <p className="text-center mt-6 text-slate-500 text-sm">Already have an account? <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium no-underline">Sign in</Link></p>
    </div>
  );
}
