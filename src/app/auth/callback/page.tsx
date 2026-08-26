"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClayCard } from '@/components/ui';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  useEffect(() => {
    if (!loading) router.push(session ? '/setup-profile' : '/login');
  }, [loading, session, router]);
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <ClayCard className="p-8 text-center max-w-sm">
        <div className="text-4xl mb-4">⏳</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Signing you in...</h1>
        <p className="text-slate-500 text-sm">Please wait while we complete your authentication.</p>
      </ClayCard>
    </div>
  );
}
