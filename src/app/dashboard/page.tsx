"use client";
import { useAuth } from '@/context/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ClayCard } from '@/components/ui';

export default function DashboardPage() {
  return <RequireAuth><DashboardContent /></RequireAuth>;
}

function DashboardContent() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ClayCard className="p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome!</h1>
          <p className="text-slate-500 mb-1">You are signed in as</p>
          <p className="text-primary-600 font-medium mb-6">{user?.email}</p>
          <p className="text-slate-400 text-sm mb-6">Dashboard content will be built in a future step.</p>
          <button onClick={() => signOut()}
            className="px-6 py-3 bg-white text-slate-600 rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none">
            Sign Out
          </button>
        </ClayCard>
      </div>
    </div>
  );
}
