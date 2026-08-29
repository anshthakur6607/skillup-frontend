"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClayCard } from '@/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Check if profile is complete
    const checkProfile = async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('profile_complete')
        .eq('id', session.user.id)
        .single();

      if (prof && !prof.profile_complete) {
        router.push('/setup-profile');
        return;
      }
      setProfileChecked(true);
    };
    checkProfile();
  }, [loading, session, router]);

  if (loading || !profileChecked) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <ClayCard className="p-8 text-center">
        <Loader2 size={24} className="animate-spin text-primary-500 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </ClayCard>
    </div>
  );
  if (!session) return null;
  return <>{children}</>;
}
