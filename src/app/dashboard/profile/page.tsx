"use client";

/**
 * Profile — view and edit user profile information.
 * Shows profile details, role, department, and allows editing.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  GraduationCap,
  Clock,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  designation: string;
  department_id: string;
  job_role: string;
  education: string;
  years_of_experience: number;
  role: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    designation: "",
    job_role: "",
    education: "",
    years_of_experience: 0,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.status === "ok" && data.data?.profile) {
          const p = data.data.profile;
          setProfile(p);
          setFormData({
            full_name: p.full_name || "",
            designation: p.designation || "",
            job_role: p.job_role || "",
            education: p.education || "",
            years_of_experience: p.years_of_experience || 0,
          });
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setProfile({ ...profile!, ...formData });
        setEditing(false);
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile. Please try again.");
      }
    } catch {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            View and manage your profile information
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setMessage("");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-cyan-400 text-white rounded-xl text-sm font-semibold cursor-pointer border-none disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-sm ${
            message.includes("success")
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Profile Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <ClayCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {profile?.full_name || "User"}
              </h2>
              <p className="text-sm text-slate-500">{profile?.email || user?.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium mt-1 inline-block">
                {profile?.role || "Employee"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <ProfileField
              icon={User}
              label="Full Name"
              value={formData.full_name}
              editing={editing}
              onChange={(v) => setFormData({ ...formData, full_name: v })}
            />
            <ProfileField
              icon={Mail}
              label="Email"
              value={profile?.email || user?.email || ""}
              editing={false}
            />
            <ProfileField
              icon={Briefcase}
              label="Designation"
              value={formData.designation}
              editing={editing}
              onChange={(v) => setFormData({ ...formData, designation: v })}
            />
            <ProfileField
              icon={Building2}
              label="Job Role"
              value={formData.job_role}
              editing={editing}
              onChange={(v) => setFormData({ ...formData, job_role: v })}
            />
            <ProfileField
              icon={GraduationCap}
              label="Education"
              value={formData.education}
              editing={editing}
              onChange={(v) => setFormData({ ...formData, education: v })}
            />
            <ProfileField
              icon={Clock}
              label="Years of Experience"
              value={String(formData.years_of_experience)}
              editing={editing}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  years_of_experience: parseInt(v) || 0,
                })
              }
              type="number"
            />
          </div>
        </ClayCard>
      </motion.div>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  editing,
  onChange,
  type = "text",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  editing: boolean;
  onChange?: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <Icon size={16} className="text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        {editing && onChange ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full mt-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-300"
          />
        ) : (
          <p className="text-sm font-medium text-slate-800 mt-0.5">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}
