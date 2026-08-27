"use client";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard, FloatingShape } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface LItem {
  id: string;
  name: string;
}
interface OItem {
  id: string;
  name: string;
  ministry?: string;
  state?: string;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [govLevel, setGovLevel] = useState<"" | "center" | "state">("");
  const [ministry, setMinistry] = useState("");
  const [st, setSt] = useState("");
  const [org, setOrg] = useState("");
  const [des, setDes] = useState("");
  const [phone, setPhone] = useState("");
  const [ministries, setMinistries] = useState<LItem[]>([]);
  const [states, setStates] = useState<LItem[]>([]);
  const [orgs, setOrgs] = useState<OItem[]>([]);
  const [designations, setDesignations] = useState<LItem[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/login");
    }
  }, [authLoading, session, router]);

  // Check if profile is already complete — if so, redirect to dashboard
  useEffect(() => {
    if (!session) return;
    const checkProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile-status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.status === "ok" && data.data?.profileComplete) {
          router.push("/dashboard");
        }
      } catch {
        // Can't check — continue with setup
      }
    };
    checkProfile();
  }, [session, router]);

  // Fetch lookup data
  useEffect(() => {
    if (!session) return;
    const h = { Authorization: "Bearer " + session.access_token };
    Promise.all([
      fetch("/api/lookups/central_ministries", { headers: h }).then((r) =>
        r.json()
      ),
      fetch("/api/lookups/indian_states", { headers: h }).then((r) =>
        r.json()
      ),
      fetch("/api/lookups/designations", { headers: h }).then((r) =>
        r.json()
      ),
    ])
      .then(([m, s, d]) => {
        if (m.data) setMinistries(m.data);
        if (s.data) setStates(s.data);
        if (d.data) setDesignations(d.data);
      })
      .catch(() => {});
  }, [session]);

  // Fetch organisations based on ministry/state selection
  useEffect(() => {
    if (!session) return;
    const h = { Authorization: "Bearer " + session.access_token };
    let url = "";
    if (govLevel === "center" && ministry)
      url =
        "/api/lookups/organisations/filter?ministry=" +
        encodeURIComponent(ministry);
    else if (govLevel === "state" && st)
      url =
        "/api/lookups/organisations/filter?ministry=" +
        encodeURIComponent(st); // backend uses ministry param for both
    if (url)
      fetch(url, { headers: h })
        .then((r) => r.json())
        .then((d) => {
          if (d.data) setOrgs(d.data);
        })
        .catch(() => {});
    else setOrgs([]);
  }, [govLevel, ministry, st, session]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!govLevel) {
        setError("Please select Center or State.");
        return;
      }
      if (govLevel === "center" && !ministry) {
        setError("Please select a ministry.");
        return;
      }
      if (govLevel === "state" && !st) {
        setError("Please select a state.");
        return;
      }
      if (!org) {
        setError("Please select an organisation.");
        return;
      }
      if (!des) {
        setError("Please select a designation.");
        return;
      }
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      // Use the server-side API endpoint
      const res = await fetch("/api/auth/setup-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          government_level: govLevel,
          ministry: govLevel === "center" ? ministry : null,
          state: govLevel === "state" ? st : null,
          organisation: org,
          designation: des,
          phone: phone || null,
        }),
      });
      const data = await res.json();
      if (data.status !== "ok") {
        throw new Error(data.message || "Failed to save profile");
      }
      router.push("/dashboard");
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ic =
    "w-full px-4 py-3 rounded-xl bg-surface border-none shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all appearance-none";
  const lc = "block text-sm font-medium text-slate-700 mb-1";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden px-4 py-12">
      <FloatingShape
        animation="animate-float-1"
        size={250}
        top="10%"
        left="5%"
        color="linear-gradient(135deg, #3b82f6, #22d3ee)"
        opacity={0.1}
      />
      <FloatingShape
        animation="animate-float-2"
        size={200}
        bottom="20%"
        right="10%"
        color="linear-gradient(135deg, #22d3ee, #3b82f6)"
        opacity={0.08}
      />
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Complete Your Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">Step {step} of 2</p>
          <div className="flex items-center gap-2 mt-3 justify-center">
            <div
              className={
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " +
                (step >= 1
                  ? "bg-gradient-to-r from-primary-500 to-cyan-400 text-white"
                  : "bg-slate-200 text-slate-500")
              }
            >
              1
            </div>
            <div
              className={
                "w-16 h-1 rounded " +
                (step >= 2
                  ? "bg-gradient-to-r from-primary-500 to-cyan-400"
                  : "bg-slate-200")
              }
            />
            <div
              className={
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " +
                (step >= 2
                  ? "bg-gradient-to-r from-primary-500 to-cyan-400 text-white"
                  : "bg-slate-200 text-slate-500")
              }
            >
              2
            </div>
          </div>
        </div>
        <ClayCard className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className={lc}>Center / State *</label>
                  <div className="flex gap-4">
                    {(["center", "state"] as const).map((v) => (
                      <label
                        key={v}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="govLevel"
                          value={v}
                          checked={govLevel === v}
                          onChange={() => {
                            setGovLevel(v);
                            setOrg("");
                          }}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-sm text-slate-700 capitalize">
                          {v}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {govLevel === "center" && (
                  <div>
                    <label className={lc}>Ministry / Department *</label>
                    <select
                      value={ministry}
                      onChange={(e) => setMinistry(e.target.value)}
                      className={ic}
                    >
                      <option value="">Select ministry</option>
                      {ministries.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {govLevel === "state" && (
                  <>
                    <div>
                      <label className={lc}>State *</label>
                      <select
                        value={st}
                        onChange={(e) => setSt(e.target.value)}
                        className={ic}
                      >
                        <option value="">Select state</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={lc}>Department *</label>
                      <select
                        value={ministry}
                        onChange={(e) => setMinistry(e.target.value)}
                        className={ic}
                      >
                        <option value="">Select department</option>
                        {ministries.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {govLevel && (
                  <div>
                    <label className={lc}>Organisation *</label>
                    <select
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className={ic}
                    >
                      <option value="">Select organisation</option>
                      {orgs.map((o) => (
                        <option key={o.id} value={o.name}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={lc}>Designation *</label>
                  <select
                    value={des}
                    onChange={(e) => setDes(e.target.value)}
                    className={ic}
                  >
                    <option value="">Select designation</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={lc}>Phone Number (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={ic}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">
                    Review your details:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    <li>
                      Level:{" "}
                      <span className="font-medium capitalize">{govLevel}</span>
                    </li>
                    {govLevel === "center" && (
                      <li>
                        Ministry: <span className="font-medium">{ministry}</span>
                      </li>
                    )}
                    {govLevel === "state" && (
                      <li>
                        State: <span className="font-medium">{st}</span>
                      </li>
                    )}
                    <li>
                      Organisation: <span className="font-medium">{org}</span>
                    </li>
                    <li>
                      Designation: <span className="font-medium">{des}</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff] transition-all cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : step === 1 ? (
                  "Next"
                ) : (
                  "Complete Setup"
                )}
              </button>
            </div>
          </form>
        </ClayCard>
      </div>
    </div>
  );
}
