"use client";
/**
 * SetupProfilePage — 3-step wizard for new users after signup.
 *
 * Step 1: Organization Details (Center/State, Ministry, Sub-Department, Org, Designation)
 * Step 2: Professional Background (Job Role, Education, Experience, Language)
 * Step 3: Review + Phone + Competency Preview
 *
 * Modeled after iGOT Karmayogi's registration flow but extended with
 * professional fields needed for personalised competency recommendations.
 */
import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClayCard, FloatingShape } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";
import {
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  ChevronRight,
  ChevronLeft,
  Check,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Award,
  Loader2,
  Shield,
} from "lucide-react";

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

const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School / Secondary" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's Degree (Arts/Science/Commerce)" },
  { value: "bachelors_engineering", label: "Bachelor's Degree (Engineering/Technology)" },
  { value: "masters", label: "Master's Degree (Arts/Science/Commerce)" },
  { value: "masters_engineering", label: "Master's Degree (Engineering/Technology)" },
  { value: "phd", label: "Ph.D / Doctorate" },
  { value: "professional", label: "Professional Degree (CA/MBBS/LLB/etc.)" },
  { value: "other", label: "Other" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "gu", label: "Gujarati" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "or", label: "Odia" },
  { value: "pa", label: "Punjabi" },
  { value: "as", label: "Assamese" },
  { value: "ur", label: "Urdu" },
];

const COMPETENCY_DOMAINS = [
  {
    name: "Statistical",
    description: "Survey design, sampling techniques, data analysis, statistical inference",
    icon: BarChart3,
    color: "text-primary-600 bg-primary-50",
  },
  {
    name: "Technical",
    description: "Python, R, SQL, data engineering, cloud computing",
    icon: BookOpen,
    color: "text-cyan-600 bg-cyan-50",
  },
  {
    name: "Digital Governance",
    description: "Data privacy, cybersecurity, e-governance, digital public infrastructure",
    icon: ClipboardCheck,
    color: "text-primary-600 bg-primary-50",
  },
  {
    name: "Behavioural & Managerial",
    description: "Leadership, communication, project management, critical thinking",
    icon: Award,
    color: "text-cyan-600 bg-cyan-50",
  },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [step, setStep] = useState(0); // 0=consent, 1=org, 2=professional, 3=review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Organization
  const [consentGiven, setConsentGiven] = useState(false);
  const [govLevel, setGovLevel] = useState<"" | "center" | "state">("");
  const [ministry, setMinistry] = useState("");
  const [state, setState] = useState("");
  const [department, setDepartment] = useState("");
  const [org, setOrg] = useState("");
  const [des, setDes] = useState("");

  // Step 2 — Professional
  const [jobRole, setJobRole] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [language, setLanguage] = useState("en");

  // Step 3 — Review
  const [phone, setPhone] = useState("");

  // Dropdown data
  const [ministries, setMinistries] = useState<LItem[]>([]);
  const [states, setStates] = useState<LItem[]>([]);
  const [departments, setDepartments] = useState<LItem[]>([]);
  const [orgs, setOrgs] = useState<OItem[]>([]);
  const [designations, setDesignations] = useState<LItem[]>([]);

  // Fetch base lookups on mount
  const fetchBaseLookups = useCallback(async () => {
    if (!session) return;
    const h = { Authorization: "Bearer " + session.access_token };
    try {
      const [m, s, d] = await Promise.all([
        fetch("/api/lookups/central_ministries", { headers: h }).then((r) => r.json()),
        fetch("/api/lookups/indian_states", { headers: h }).then((r) => r.json()),
        fetch("/api/lookups/designations", { headers: h }).then((r) => r.json()),
      ]);
      if (m.data) setMinistries(m.data);
      if (s.data) setStates(s.data);
      if (d.data) setDesignations(d.data);
    } catch {
      /* silent — dropdowns will just be empty */
    }
  }, [session]);

  useEffect(() => {
    fetchBaseLookups();
  }, [fetchBaseLookups]);

  // Fetch filtered lookups when ministry/state changes
  useEffect(() => {
    if (!session || !govLevel) return;
    const h = { Authorization: "Bearer " + session.access_token };
    const params = govLevel === "center" ? { ministry } : { state };

    if (govLevel === "center" && ministry) {
      // Fetch departments under ministry
      fetch(`/api/lookups/departments/filter?ministry=${encodeURIComponent(ministry)}`, { headers: h })
        .then((r) => r.json())
        .then((d) => { if (d.data) setDepartments(d.data); })
        .catch(() => setDepartments([]));

      // Fetch orgs under ministry
      fetch(`/api/lookups/organisations/filter?ministry=${encodeURIComponent(ministry)}`, { headers: h })
        .then((r) => r.json())
        .then((d) => { if (d.data) setOrgs(d.data); })
        .catch(() => setOrgs([]));
    } else if (govLevel === "state" && state) {
      // Fetch departments under state
      fetch(`/api/lookups/departments/filter?state=${encodeURIComponent(state)}`, { headers: h })
        .then((r) => r.json())
        .then((d) => { if (d.data) setDepartments(d.data); })
        .catch(() => setDepartments([]));

      // Fetch orgs under state
      fetch(`/api/lookups/organisations/filter?state=${encodeURIComponent(state)}`, { headers: h })
        .then((r) => r.json())
        .then((d) => { if (d.data) setOrgs(d.data); })
        .catch(() => setOrgs([]));
    } else {
      setDepartments([]);
      setOrgs([]);
    }
    // Reset dependent fields
    setDepartment("");
    setOrg("");
  }, [govLevel, ministry, state, session]);

  const validateStep1 = (): string | null => {
    if (!govLevel) return "Please select Center or State.";
    if (govLevel === "center" && !ministry) return "Please select a ministry.";
    if (govLevel === "state" && !state) return "Please select a state.";
    if (!org) return "Please select an organisation.";
    if (!des) return "Please select a designation.";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!jobRole.trim()) return "Please enter your job role.";
    if (!education) return "Please select your education level.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 0) {
      if (!consentGiven) { setError("Please provide consent to continue."); return; }
      setStep(1);
      return;
    }

    if (step === 1) {
      const ve = validateStep1();
      if (ve) { setError(ve); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      const ve = validateStep2();
      if (ve) { setError(ve); return; }
      setStep(3);
      return;
    }

    // Step 3 — save
    setLoading(true);
    try {
      const profileData: Record<string, unknown> = {
        government_level: govLevel,
        ministry: govLevel === "center" ? ministry : null,
        state: govLevel === "state" ? state : null,
        department_name: department || null,
        organisation: org,
        designation: des,
        job_role: jobRole.trim(),
        education_level: education,
        years_of_experience: experience ? parseInt(experience, 10) : null,
        preferred_language: language,
        phone: phone || null,
        profile_complete: true,
      };

      const { error: ue } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user?.id || "");

      if (ue) throw ue;

      // Generate initial competency snapshot (non-blocking)
      try {
        await fetch("/api/competencies/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Non-critical — dashboard will still work
      }

      router.push("/dashboard");
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-surface border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden px-4 py-12">
      <FloatingShape animation="animate-float-1" size={250} top="10%" left="5%" color="linear-gradient(135deg, #3b82f6, #22d3ee)" opacity={0.1} />
      <FloatingShape animation="animate-float-2" size={200} bottom="20%" right="10%" color="linear-gradient(135deg, #22d3ee, #3b82f6)" opacity={0.08} />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Complete Your Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === 0 && "Data consent & privacy"}
            {step === 1 && "Tell us about your organisation"}
            {step === 2 && "Your professional background"}
            {step === 3 && "Review and confirm"}
          </p>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mt-4 justify-center">
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? "bg-gradient-to-r from-primary-500 to-cyan-400 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > s ? <Check size={12} /> : s + 1}
                </div>
                {s < 3 && (
                  <div
                    className={`w-8 h-0.5 rounded ${
                      step > s ? "bg-gradient-to-r from-primary-500 to-cyan-400" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <ClayCard className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ========== STEP 0: Consent ========== */}
            {step === 0 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                    <Shield size={28} className="text-primary-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Data Consent & Privacy</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Before we set up your profile, we need your consent for data handling.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">What data we collect</h3>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Your name, designation, department, and job role (for personalised recommendations)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Your education and experience (to calibrate skill expectations)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <span>Your course completions and assessment scores (to track your skill growth)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <h3 className="text-sm font-semibold text-amber-800 mb-2">How we protect your data</h3>
                    <ul className="text-xs text-amber-700 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-amber-600 mt-0.5 shrink-0" />
                        <span>Your data is encrypted and stored securely in India (MeghRaj/GI Cloud compliant)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-amber-600 mt-0.5 shrink-0" />
                        <span>Only you and your designated managers can see your individual scores</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={12} className="text-amber-600 mt-0.5 shrink-0" />
                        <span>We never share personal data with third parties without your explicit consent</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">APAR / Performance Data (Optional)</h3>
                    <p className="text-xs text-blue-700 mb-3">
                      If you choose to link your APAR (Annual Performance Appraisal Report) data, SkillUp can provide more accurate skill-gap analysis aligned with your career progression. This is entirely optional and can be enabled later.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-primary-500 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        I consent to SkillUp collecting and processing my data as described above
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        You can withdraw consent at any time from your profile settings. Required to use the platform.
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}

            {/* ========== STEP 1: Organization ========== */}
            {step === 1 && (
              <>
                {/* Center / State */}
                <div>
                  <label className={labelClass}>Government Level *</label>
                  <div className="flex gap-4">
                    {(["center", "state"] as const).map((v) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="govLevel"
                          value={v}
                          checked={govLevel === v}
                          onChange={() => {
                            setGovLevel(v);
                            setOrg("");
                            setDepartment("");
                          }}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-sm text-slate-700 flex items-center gap-1.5">
                          {v === "center" ? <Building2 size={14} /> : <MapPin size={14} />}
                          {v === "center" ? "Central Government" : "State Government"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ministry or State */}
                {govLevel === "center" && (
                  <div>
                    <label className={labelClass}>Ministry / Department *</label>
                    <select
                      value={ministry}
                      onChange={(e) => setMinistry(e.target.value)}
                      className={inputClass}
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
                      <label className={labelClass}>State *</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={inputClass}
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
                      <label className={labelClass}>Department *</label>
                      <select
                        value={ministry}
                        onChange={(e) => setMinistry(e.target.value)}
                        className={inputClass}
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

                {/* Sub-Department (NEW) */}
                {govLevel && departments.length > 0 && (
                  <div>
                    <label className={labelClass}>Division / Sub-Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select division (optional)</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">
                      Your specific division or unit within the department
                    </p>
                  </div>
                )}

                {/* Organisation */}
                {govLevel && (
                  <div>
                    <label className={labelClass}>Organisation *</label>
                    <select
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className={inputClass}
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

                {/* Designation */}
                <div>
                  <label className={labelClass}>Designation *</label>
                  <select
                    value={des}
                    onChange={(e) => setDes(e.target.value)}
                    className={inputClass}
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
            )}

            {/* ========== STEP 2: Professional Background ========== */}
            {step === 2 && (
              <>
                <div>
                  <label className={labelClass}>Job Role *</label>
                  <div className="relative">
                    <Briefcase
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="e.g. Field Surveyor, Data Analyst, Section Head"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Your specific role — more detailed than designation
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Education Level *</label>
                  <div className="relative">
                    <GraduationCap
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className={`${inputClass} pl-10`}
                    >
                      <option value="">Select education level</option>
                      {EDUCATION_LEVELS.map((e) => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 5"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Helps calibrate skill expectations for your career stage
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={inputClass}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    For future multilingual content and assessments
                  </p>
                </div>
              </>
            )}

            {/* ========== STEP 3: Review + Competency Preview ========== */}
            {step === 3 && (
              <>
                {/* Phone */}
                <div>
                  <label className={labelClass}>Phone Number (optional)</label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* Review Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Your Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs">Level</span>
                      <p className="text-slate-700 font-medium capitalize">{govLevel}</p>
                    </div>
                    {govLevel === "center" && ministry && (
                      <div>
                        <span className="text-slate-400 text-xs">Ministry</span>
                        <p className="text-slate-700 font-medium text-xs leading-snug">{ministry}</p>
                      </div>
                    )}
                    {govLevel === "state" && state && (
                      <div>
                        <span className="text-slate-400 text-xs">State</span>
                        <p className="text-slate-700 font-medium">{state}</p>
                      </div>
                    )}
                    {department && (
                      <div className="col-span-2">
                        <span className="text-slate-400 text-xs">Division</span>
                        <p className="text-slate-700 font-medium text-xs leading-snug">{department}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-slate-400 text-xs">Organisation</span>
                      <p className="text-slate-700 font-medium text-xs leading-snug">{org}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Designation</span>
                      <p className="text-slate-700 font-medium">{des}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Job Role</span>
                      <p className="text-slate-700 font-medium">{jobRole}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Education</span>
                      <p className="text-slate-700 font-medium text-xs">
                        {EDUCATION_LEVELS.find((e) => e.value === education)?.label || education}
                      </p>
                    </div>
                    {experience && (
                      <div>
                        <span className="text-slate-400 text-xs">Experience</span>
                        <p className="text-slate-700 font-medium">{experience} years</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Integration Info */}
                <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Connected to iGOT Karmayogi
                  </p>
                  <p className="text-xs text-slate-500">
                    Your profile will be synced with iGOT so your course completions
                    and training records are automatically reflected in your skill profile.
                    NSSTA TPAC training sessions will also appear in your recommendations.
                  </p>
                </div>

                {/* Competency Preview */}
                <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    What happens next
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    After setup, you&apos;ll take a competency assessment across 4 domains.
                    Your responses generate a personalised skill profile and learning path.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {COMPETENCY_DOMAINS.map((domain) => (
                      <div
                        key={domain.name}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-100"
                      >
                        <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${domain.color}`}>
                          <domain.icon size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700 leading-tight">
                            {domain.name}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {domain.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-5 py-3 bg-white text-slate-600 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer text-sm"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : step === 3 ? (
                  "Complete Setup"
                ) : (
                  <>
                    Continue
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </ClayCard>
      </div>
    </div>
  );
}
