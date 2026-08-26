"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ClayCard } from '@/components/ui';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !session) router.push('/login');
  }, [loading, session, router]);
  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <ClayCard className="p-8 text-center"><div className="text-4xl mb-4">⏳</div><p className="text-slate-500">Loading...</p></ClayCard>
    </div>
  );
  if (!session) return null;
  return <>{children}</>;
}
