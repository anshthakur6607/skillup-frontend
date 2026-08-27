"use client";
/**
 * AuthCallbackPage — handles OAuth and email verification callbacks.
 *
 * After Supabase processes the auth code/token from the redirect URL,
 * this page checks profile completion and redirects appropriately:
 * - Profile complete → /dashboard
 * - Profile incomplete → /setup-profile
 * - No session → /login
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { ClayCard } from "@/components/ui";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    if (loading) return;

    if (!session) {
      // No session after auth processing — something went wrong
      // or the verification link was invalid/expired
      setStatus("Authentication failed. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    // We have a session — now check if profile is complete
    const checkProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile-status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();

        if (data.status === "ok" && data.data?.profileComplete) {
          setStatus("Profile complete. Redirecting to dashboard...");
          router.push("/dashboard");
        } else {
          setStatus("Setting up your profile...");
          router.push("/setup-profile");
        }
      } catch {
        // Can't reach backend — default to setup-profile
        setStatus("Setting up your profile...");
        router.push("/setup-profile");
      }
    };

    checkProfile();
  }, [loading, session, router]);

  // Also handle the case where Supabase sends tokens in the URL hash
  // (some OAuth providers use hash-based redirects)
  useEffect(() => {
    const handleHashTokens = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        // Supabase handles this automatically via the client SDK,
        // but we can explicitly process it if needed
        setStatus("Completing sign-in...");
      }
    };

    handleHashTokens();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <ClayCard className="p-8 text-center max-w-sm">
        <div className="mb-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Signing you in...</h1>
        <p className="text-slate-500 text-sm">{status}</p>
      </ClayCard>
    </div>
  );
}
