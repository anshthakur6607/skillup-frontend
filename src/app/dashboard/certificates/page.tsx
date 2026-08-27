"use client";

/**
 * Certificates — shows earned certificates with verification codes.
 * Inspired by iGOT Karmayogi certificate section.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Calendar,
} from "lucide-react";

interface Certificate {
  id: string;
  course_id: string;
  course_title: string;
  issued_at: string;
  verification_code: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function CertificatesPage() {
  const { session } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const fetchCertificates = async () => {
      try {
        const res = await fetch("/api/dashboard/certificates", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.status === "ok") {
          setCertificates(data.data || []);
        }
      } catch {
        // Use empty array
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [session]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Certificates</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your earned course completion certificates
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : certificates.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {certificates.map((cert) => (
            <motion.div key={cert.id} variants={fadeUp}>
              <ClayCard className="p-5 relative overflow-hidden">
                {/* Certificate decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-[40px]" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0">
                      <Award size={22} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
                        {cert.course_title}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <Calendar size={12} />
                        {new Date(cert.issued_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Verification Code
                    </p>
                    <p className="text-xs font-mono text-slate-700 break-all">
                      {cert.verification_code}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                      <CheckCircle2 size={12} />
                      Verified
                    </span>
                  </div>
                </div>
              </ClayCard>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <ClayCard className="p-12 text-center">
          <Award size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No certificates yet
          </h3>
          <p className="text-sm text-slate-500">
            Complete courses to earn certificates.
          </p>
        </ClayCard>
      )}
    </div>
  );
}
