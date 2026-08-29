"use client";
/**
 * RequireAdmin — route guard that checks the user has admin role.
 * Must be used inside RequireAuth (which handles login + profile check).
 *
 * Checks the profiles table for role = 'admin'.
 * Shows 403 error page if not admin.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ClayCard } from "@/components/ui";
import { Loader2, ShieldAlert } from "lucide-react";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const checkAdmin = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
      setChecking(false);
    };

    checkAdmin();
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <ClayCard className="p-8 text-center">
          <Loader2 size={24} className="animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Checking permissions...</p>
        </ClayCard>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <ClayCard className="p-12 text-center max-w-md">
          <ShieldAlert size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6">
            You do not have administrator privileges to access this page.
            Contact your system administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 cursor-pointer"
            style={{ borderRadius: "4px" }}
          >
            Back to Dashboard
          </button>
        </ClayCard>
      </div>
    );
  }

  return <>{children}</>;
}
