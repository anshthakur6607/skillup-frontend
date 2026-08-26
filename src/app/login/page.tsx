/**
 * LoginPage — email/password, Google OAuth, and Government SSO login.
 * Uses claymorphism design system. Error messages are generic to prevent enumeration.
 */
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClayCard } from '@/components/ui';
import { FloatingShape } from '@/components/ui';

const SSO_DOMAIN = process.env.NEXT_PUBLIC_SSO_DOMAIN || '';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithOAuth, signInWithSSO, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    if (authError) {
      setError(authError.message.includes('rate') ? 'Too many attempts. Please wait and try again.' : 'Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  };

  const handleGoogleSignIn = async () => {
    const { error: authError } = await signInWithOAuth('google');
    if (authError) setError('Could not start Google sign-in. Please try again.');
  };

  const handleSSO = async () => {
    if (!SSO_DOMAIN) { setError('Government SSO is being set up — please use email or Google for now.'); return; }
    const { error: authError } = await signInWithSSO(SSO_DOMAIN);
    if (authError) setError('Government SSO is being set up — please use email or Google for now.');
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    const { error: authError } = await resetPassword(resetEmail.trim());
    setResetLoading(false);
    if (authError) setResetMessage('Something went wrong. Please try again.');
    else setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden px-4">
      <FloatingShape animation="animate-float-1" size={250} top="10%" left="5%" color="linear-gradient(135deg, #3b82f6, #22d3ee)" opacity={0.1} />
      <FloatingShape animation="animate-float-2" size={200} bottom="20%" right="10%" color="linear-gradient(135deg, #22d3ee, #3b82f6)" opacity={0.08} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-primary-700">SkillUp</span>
          </Link>
        </div>

        <ClayCard className="p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-6">Sign in to your account</p>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          {!showReset ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                  placeholder="you@example.com" disabled={loading} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                  placeholder="••••••••" disabled={loading} />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => { setShowReset(true); setResetEmail(email); }}
                  className="text-sm text-primary-500 hover:text-primary-600 no-underline cursor-pointer bg-transparent border-none">
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {resetSent ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-4">📧</div>
                  <p className="text-slate-700 font-medium">Check your email</p>
                  <p className="text-slate-500 text-sm mt-1">We sent a password reset link to {resetEmail}</p>
                  <button onClick={() => { setShowReset(false); setResetSent(false); }}
                    className="mt-4 text-primary-500 hover:text-primary-600 text-sm cursor-pointer bg-transparent border-none">
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <p className="text-slate-600 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input id="reset-email" type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                      disabled={resetLoading} />
                  </div>
                  {resetMessage && <p className="text-red-600 text-sm">{resetMessage}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowReset(false)}
                      className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none">
                      Cancel
                    </button>
                    <button type="submit" disabled={resetLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none disabled:opacity-50">
                      {resetLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          {!showReset && (<>
            <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-slate-200" /><span className="text-sm text-slate-400">or continue with</span><div className="flex-1 h-px bg-slate-200" /></div>
            <div className="space-y-3">
              <button onClick={handleGoogleSignIn} className="w-full py-3 bg-white text-slate-700 rounded-xl font-medium shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google</button>
              <button onClick={handleSSO} className="w-full py-3 bg-white text-slate-700 rounded-xl font-medium shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none flex items-center justify-center gap-3">
                🛡️ Sign in with Government SSO</button>
            </div>
          </>)}
        </ClayCard>
        {!showReset && <p className="text-center mt-6 text-slate-500 text-sm">Don&apos;t have an account? <Link href="/register" className="text-primary-500 hover:text-primary-600 font-medium no-underline">Sign up</Link></p>}
      </div>
    </div>
  );
}