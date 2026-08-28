"use client";

/**
 * Competencies — shows user's competency scores by domain.
 * Features a radar/spider chart visualization and competency cards.
 * Inspired by iGOT Karmayogi Competency Hub.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import { Target, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

interface CompetencyScore {
  id: string;
  name: string;
  domain: string;
  score: number;
  last_assessed_at: string | null;
}

interface DomainGroup {
  domain: string;
  competencies: CompetencyScore[];
  avgScore: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 60) return "text-blue-600 bg-blue-50";
  if (score >= 40) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Developing";
  return "Needs Improvement";
};

export default function CompetenciesPage() {
  const { session } = useAuth();
  const [competencies, setCompetencies] = useState<CompetencyScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const fetchCompetencies = async () => {
      try {
        const res = await fetch("/api/dashboard/competencies", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.status === "ok") {
          setCompetencies(data.data || []);
        }
      } catch {
        // Use empty array
      } finally {
        setLoading(false);
      }
    };
    fetchCompetencies();
  }, [session]);

  // Group by domain
  const domainGroups: DomainGroup[] = [];
  const domainMap = new Map<string, CompetencyScore[]>();
  for (const c of competencies) {
    const existing = domainMap.get(c.domain) || [];
    existing.push(c);
    domainMap.set(c.domain, existing);
  }
  for (const [domain, comps] of domainMap) {
    const avgScore =
      comps.reduce((sum, c) => sum + c.score, 0) / comps.length;
    domainGroups.push({ domain, competencies: comps, avgScore });
  }

  const overallScore =
    competencies.length > 0
      ? Math.round(
          competencies.reduce((s, c) => s + c.score, 0) / competencies.length
        )
      : 0;

  // Radar chart data points (simple CSS-based)
  const radarPoints = competencies.slice(0, 8).map((c, i) => {
    const angle = (i / Math.min(competencies.length, 8)) * 2 * Math.PI - Math.PI / 2;
    const radius = (c.score / 100) * 120;
    return {
      x: 150 + radius * Math.cos(angle),
      y: 150 + radius * Math.sin(angle),
      label: c.name.substring(0, 12),
      score: c.score,
    };
  });

  const radarPolygon = radarPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Competencies</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track your skill levels across competency domains
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : competencies.length === 0 ? (
        <ClayCard className="p-12 text-center">
          <Target size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No competency data yet
          </h3>
          <p className="text-sm text-slate-500">
            Complete assessments to build your competency profile.
          </p>
        </ClayCard>
      ) : (
        <>
          {/* Overall Score + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <ClayCard className="p-6 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Competency Radar
                </h3>
                <svg width="300" height="300" viewBox="0 0 300 300" className="w-full max-w-[280px]">
                  {/* Background circles */}
                  {[25, 50, 75, 100].map((pct) => (
                    <circle
                      key={pct}
                      cx="150"
                      cy="150"
                      r={pct * 1.2}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Axes */}
                  {radarPoints.map((_, i) => {
                    const angle =
                      (i / radarPoints.length) * 2 * Math.PI - Math.PI / 2;
                    return (
                      <line
                        key={i}
                        x1="150"
                        y1="150"
                        x2={150 + 120 * Math.cos(angle)}
                        y2={150 + 120 * Math.sin(angle)}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {/* Data polygon */}
                  <polygon
                    points={radarPolygon}
                    fill="rgba(59, 130, 246, 0.15)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Data points */}
                  {radarPoints.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        className="text-[9px] fill-slate-500"
                      >
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </ClayCard>
            </motion.div>

            {/* Overall Score Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <ClayCard className="p-6 flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-4">
                  <svg width="128" height="128" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(overallScore / 100) * 352} 352`}
                      transform="rotate(-90 64 64)"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">
                      {overallScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Overall Score
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {getScoreLabel(overallScore)}
                </p>
                <div className="mt-3 text-center">
                  <p className="text-xs text-slate-500">
                    {competencies.length} competencies tracked
                  </p>
                </div>
              </ClayCard>
            </motion.div>

            {/* Domain Summary */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <ClayCard className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Domain Summary
                </h3>
                <div className="space-y-3">
                  {domainGroups.map((group) => (
                    <div key={group.domain}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">
                          {group.domain}
                        </span>
                        <span className={`font-bold ${getScoreColor(Math.round(group.avgScore)).split(" ")[0]}`}>
                          {Math.round(group.avgScore)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full"
                          style={{ width: `${group.avgScore}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {group.competencies.length} competencies
                      </p>
                    </div>
                  ))}
                </div>
              </ClayCard>
            </motion.div>
          </div>

          {/* Competency Cards by Domain */}
          <div className="space-y-6">
            {domainGroups.map((group) => (
              <motion.div
                key={group.domain}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-lg font-bold text-slate-800 mb-3">
                  {group.domain}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.competencies.map((comp) => (
                    <ClayCard key={comp.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">
                            {comp.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-cyan-400 rounded-full"
                                style={{ width: `${comp.score}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(
                                comp.score
                              )}`}
                            >
                              {comp.score}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            {comp.last_assessed_at
                              ? `Last assessed: ${new Date(
                                  comp.last_assessed_at
                                ).toLocaleDateString()}`
                              : "Not yet assessed"}
                          </p>
                        </div>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ml-2 ${
                            comp.score >= 80
                              ? "bg-emerald-50"
                              : comp.score >= 60
                              ? "bg-blue-50"
                              : comp.score >= 40
                              ? "bg-amber-50"
                              : "bg-red-50"
                          }`}
                        >
                          {comp.score >= 80 ? (
                            <TrendingUp size={14} className="text-emerald-500" />
                          ) : comp.score >= 40 ? (
                            <Minus size={14} className="text-amber-500" />
                          ) : (
                            <TrendingDown size={14} className="text-red-500" />
                          )}
                        </div>
                      </div>
                    </ClayCard>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
