"use client";
/**
 * StatusPage — Internal diagnostic page at /status (not linked from nav).
 * 5 independent checks: env vars, backend, security headers, Supabase, RLS.
 * Check #5 expects to FAIL (error = RLS working correctly).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ClayCard } from '@/components/ui';
import { checkBackendHealth, authGet } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

type Status = 'checking' | 'pass' | 'fail';
interface CheckResult { status: Status; message: string; }

const statusStyles: Record<Status, { bg: string; text: string; icon: string }> = {
  checking: { bg: 'bg-slate-100', text: 'text-slate-500', icon: '⏳' },
  pass: { bg: 'bg-green-50', text: 'text-green-700', icon: '✅' },
  fail: { bg: 'bg-red-50', text: 'text-red-700', icon: '❌' },
};

function StatusRow({ label, result, onRetry }: { label: string; result: CheckResult; onRetry: () => void }) {
  const s = statusStyles[result.status];
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl ${s.bg} transition-all duration-300`}>
      <span className="text-xl mt-0.5">{s.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${s.text}`}>{label}</p>
        <p className="text-sm text-slate-600 mt-1 break-words">{result.message}</p>
      </div>
      <button onClick={onRetry} className="px-3 py-1 text-xs font-medium text-slate-500 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-none shrink-0" disabled={result.status === 'checking'}>Retry</button>
    </div>
  );
}

export default function StatusPage() {
  const [env, setEnv] = useState<CheckResult>({ status: 'checking', message: 'Checking...' });
  const [backend, setBackend] = useState<CheckResult>({ status: 'checking', message: 'Checking...' });
  const [headers, setHeaders] = useState<CheckResult>({ status: 'checking', message: 'Checking...' });
  const [supabaseCheck, setSupabaseCheck] = useState<CheckResult>({ status: 'checking', message: 'Checking...' });
  const [sessionCheck, setSessionCheck] = useState<CheckResult>({ status: "checking", message: "Checking..." });
  const [rls, setRls] = useState<CheckResult>({ status: 'checking', message: 'Checking...' });
  const [integration, setIntegration] = useState<CheckResult>({ status: 'checking', message: 'Checking...' });

  const checkEnvVars = useCallback(() => {
    setEnv({ status: 'checking', message: 'Checking...' });
    const vars = { NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
    const missing = Object.entries(vars).filter(([, v]) => !v).map(([k]) => k);
    setEnv(missing.length > 0 ? { status: 'fail', message: `${missing.join(', ')} missing — check .env.local` } : { status: 'pass', message: 'All environment variables loaded.' });
  }, []);

  const checkBackend = useCallback(async () => {
    setBackend({ status: 'checking', message: 'Calling GET /api/health...' });
    const r = await checkBackendHealth();
    if (r.data) { setBackend({ status: 'pass', message: `Backend running. Response: ${JSON.stringify(r.data)}` }); return true; }
    setBackend({ status: 'fail', message: `Could not reach backend — is it running? Check ALLOWED_ORIGINS in backend/.env includes http://localhost:3000.` }); return false;
  }, []);

  const checkHeaders = useCallback(async () => {
    setHeaders({ status: 'checking', message: 'Checking response headers...' });
    const r = await checkBackendHealth();
    if (!r.headers) { setHeaders({ status: 'fail', message: 'Could not read headers.' }); return; }
    const found = ['x-content-type-options', 'x-frame-options', 'x-xss-protection', 'content-security-policy'].filter(h => r.headers!.has(h));
    setHeaders(found.length >= 2 ? { status: 'pass', message: `Helmet headers detected: ${found.join(', ')}.` } : { status: 'fail', message: `Expected helmet headers missing. Found: ${found.length > 0 ? found.join(', ') : 'none'}.` });
  }, []);

  const checkSupabase = useCallback(async () => {
    setSupabaseCheck({ status: 'checking', message: 'Calling supabase.auth.getSession()...' });
    try {
      const { error } = await supabase.auth.getSession();
      setSupabaseCheck(error ? { status: 'fail', message: `Supabase error: ${error.message}. Check .env.local.` } : { status: 'pass', message: 'Supabase reachable. (Connectivity only — data access needs auth.)' });
    } catch (e) { setSupabaseCheck({ status: 'fail', message: `Could not reach Supabase: ${e instanceof Error ? e.message : 'Unknown'}` }); }
  }, []);

  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSessionCheck({ status: "fail", message: "Not logged in — log in first to test this check." }); return; }
    try {
      const { authGet } = await import("@/lib/api");
      const resp = await authGet("/api/auth/me", session.access_token);
      if (resp.error) { setSessionCheck({ status: "fail", message: "Could not call /api/auth/me: " + resp.error }); return; }
      const json = resp.data as { status?: string; data?: { profile?: Record<string, unknown> } };
      if (json.status === "ok" && json.data?.profile) setSessionCheck({ status: "pass", message: "Backend recognized session. Profile: " + JSON.stringify(json.data!.profile).slice(0, 120) + "..." });
      else setSessionCheck({ status: "fail", message: "Backend did not recognize session. Response: " + JSON.stringify(json) });
    } catch (e) { setSessionCheck({ status: "fail", message: "Could not call /api/auth/me: " + (e instanceof Error ? e.message : "Unknown") }); }
  }, []);

  const checkRLS = useCallback(async () => {
    setRls({ status: 'checking', message: 'Attempting anonymous SELECT on competency_domains...' });
    try {
      const { data, error } = await supabase.from('competency_domains').select('*').limit(1);
      if (error) setRls({ status: 'pass', message: `RLS correctly blocked anonymous access. Error: ${error.message}` });
      else if (data?.length) setRls({ status: 'fail', message: `⚠️ SECURITY WARNING: Anonymous access succeeded — RLS may be misconfigured.` });
      else setRls({ status: 'pass', message: 'RLS active — empty result (table may be empty, no data leaked).' });
    } catch (e) { setRls({ status: 'pass', message: `RLS blocked access (${e instanceof Error ? e.message : 'error'}).` }); }
  }, []);

  const checkIntegration = useCallback(async () => {
    setIntegration({ status: 'checking', message: 'Checking platform integration...' });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIntegration({ status: 'fail', message: 'Not logged in — log in to test this check.' }); return; }
    try {
      const resp = await authGet('/api/integrations/tpac', session.access_token);
      if (resp.error) { setIntegration({ status: 'fail', message: 'Integration endpoint error: ' + resp.error }); return; }
      const json = resp.data as { status?: string; data?: unknown[] };
      if (json.status === 'ok') setIntegration({ status: 'pass', message: 'Platform integration active. TPAC endpoint responding. (' + ((json.data as unknown[])?.length || 0) + ' sessions available)' });
      else setIntegration({ status: 'fail', message: 'Integration endpoint returned unexpected response.' });
    } catch (e) { setIntegration({ status: 'fail', message: 'Could not check integration: ' + (e instanceof Error ? e.message : 'Unknown') }); }
  }, []);

  useEffect(() => {
    checkEnvVars();
    checkBackend().then(ok => ok ? checkHeaders() : setHeaders({ status: 'fail', message: 'Skipped — backend not reachable.' }));
    checkSupabase();
    checkRLS();
    checkSession();
    checkIntegration();
  }, [checkEnvVars, checkBackend, checkHeaders, checkSupabase, checkRLS, checkSession, checkIntegration]);

  const runAll = () => {
    checkEnvVars();
    checkBackend().then(ok => ok ? checkHeaders() : setHeaders({ status: 'fail', message: 'Skipped — backend not reachable.' }));
    checkSupabase();
    checkRLS();
    checkSession();
    checkIntegration();
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary-500 hover:text-primary-600 text-sm font-medium no-underline mb-4 inline-block">← Back to Home</Link>
          <h1 className="text-3xl font-bold text-slate-800">System Status</h1>
          <p className="text-slate-500 mt-2">Diagnostic checks for frontend ↔ backend ↔ Supabase. Dev use only.</p>
        </div>
        <ClayCard className="p-6 space-y-4">
          <StatusRow label="1. Frontend environment variables" result={env} onRetry={checkEnvVars} />
          <StatusRow label="2. Backend reachable (GET /api/health)" result={backend} onRetry={checkBackend} />
          <StatusRow label="3. Backend security headers (Helmet)" result={headers} onRetry={checkHeaders} />
          <StatusRow label="4. Supabase project reachable" result={supabaseCheck} onRetry={checkSupabase} />
          <StatusRow label="5. RLS enforcement (anonymous blocked)" result={rls} onRetry={checkRLS} />
          <StatusRow label="6. Backend recognizes session (GET /api/auth/me)" result={sessionCheck} onRetry={checkSession} />
          <StatusRow label="7. Platform integration (iGOT + NSSTA TPAC)" result={integration} onRetry={checkIntegration} />
        </ClayCard>
        <div className="mt-6 text-center">
          <button onClick={runAll} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none">Run All Checks</button>
        </div>
      </div>
    </div>
  );
}
