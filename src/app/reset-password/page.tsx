"use client";
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ClayCard } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (authError) setError('Could not reset password. The link may have expired.');
    else { setSuccess(true); setTimeout(() => router.push('/login'), 3000); }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <ClayCard className="p-8 w-full max-w-md">
        {success ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Password updated!</h1>
            <p className="text-slate-500">Redirecting to sign in...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset password</h1>
            <p className="text-slate-500 mb-6">Enter your new password below.</p>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-pw" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input id="new-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                  placeholder="Min 8 chars" disabled={loading} />
              </div>
              <div>
                <label htmlFor="confirm-pw" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input id="confirm-pw" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                  placeholder="Repeat password" disabled={loading} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </ClayCard>
    </div>
  );
}
