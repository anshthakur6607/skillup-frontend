"use client";

/**
 * Skill Heatmap — department × competency visualization.
 *
 * Shows a color-coded grid where:
 * - Red (< 40%) = weak, needs training
 * - Yellow (40-70%) = moderate, can improve
 * - Green (70%+) = strong, performing well
 *
 * Used by HR planners and managers to identify skill gaps
 * across departments and plan targeted training.
 */

import { useEffect, useState, useCallback } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ClayCard } from "@/components/ui";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Target,
  Loader2,
  RefreshCw,
  Filter,
} from "lucide-react";

interface HeatmapCell {
  department: string;
  competency: string;
  avgScore: number;
  userCount: number;
  level: "weak" | "moderate" | "strong";
}

interface HeatmapData {
  departments: string[];
  competencies: string[];
  cells: HeatmapCell[];
  summary: {
    overallAverage: number;
    weakestDepartment: string;
    strongestDepartment: string;
    weakestCompetency: string;
    strongestCompetency: string;
  };
}

const LEVEL_COLORS: Record<string, string> = {
  weak: "bg-red-50 text-red-700 border-red-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  strong: "bg-green-50 text-green-700 border-green-200",
};

const LEVEL_BG: Record<string, string> = {
  weak: "bg-red-100 border-red-200",
  moderate: "bg-amber-100 border-amber-200",
  strong: "bg-green-100 border-green-200",
};

function HeatmapContent() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const fetchHeatmap = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const resp = await fetch("/api/heatmap", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!resp.ok) throw new Error("Failed to fetch");
      const result = await resp.json();
      if (result.data) {
        setData(result.data);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const filteredDepts = selectedDept
    ? data?.departments.filter((d) => d === selectedDept) || []
    : data?.departments || [];

  const filteredCells = data?.cells.filter(
    (c) => !selectedDept || c.department === selectedDept
  ) || [];

  // Group cells by department
  const cellsByDept = new Map<string, HeatmapCell[]>();
  for (const cell of filteredCells) {
    if (!cellsByDept.has(cell.department)) cellsByDept.set(cell.department, []);
    cellsByDept.get(cell.department)!.push(cell);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Skill Heatmap</h1>
          <p className="text-slate-500 text-sm mt-1">
            Department-level competency overview for HR planning
          </p>
        </div>
        <button
          onClick={fetchHeatmap}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Overall Average"
            value={`${data.summary.overallAverage}%`}
            icon={<BarChart3 size={18} className="text-primary-500" />}
          />
          <SummaryCard
            label="Strongest Department"
            value={data.summary.strongestDepartment || "N/A"}
            icon={<TrendingUp size={18} className="text-green-500" />}
          />
          <SummaryCard
            label="Weakest Department"
            value={data.summary.weakestDepartment || "N/A"}
            icon={<TrendingDown size={18} className="text-red-500" />}
          />
          <SummaryCard
            label="Training Priority"
            value={data.summary.weakestCompetency || "N/A"}
            icon={<Target size={18} className="text-amber-500" />}
          />
        </div>
      )}

      {/* Department Filter */}
      {data && data.departments.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          <button
            onClick={() => setSelectedDept("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              !selectedDept
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Departments
          </button>
          {data.departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedDept === dept
                  ? "bg-primary-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      )}

      {/* Heatmap Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={28} className="animate-spin text-primary-500" />
          <p className="text-sm text-slate-400">Generating heatmap...</p>
        </div>
      ) : error ? (
        <ClayCard className="p-12 text-center">
          <BarChart3 size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            Could not load heatmap
          </h3>
          <p className="text-sm text-slate-500">
            Make sure users have completed assessments to generate heatmap data.
          </p>
          <button
            onClick={fetchHeatmap}
            className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </ClayCard>
      ) : filteredCells.length === 0 ? (
        <ClayCard className="p-12 text-center">
          <BarChart3 size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No data yet
          </h3>
          <p className="text-sm text-slate-500">
            Complete assessments to generate skill heatmap data. The heatmap
            shows average competency scores by department.
          </p>
        </ClayCard>
      ) : (
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-400" />
              Weak (&lt;40%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400" />
              Moderate (40-70%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-400" />
              Strong (70%+)
            </span>
          </div>

          {/* Competency Headers */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div
                className="grid gap-2 mb-2"
                style={{
                  gridTemplateColumns: `180px repeat(${data?.competencies.length || 0}, 1fr)`,
                }}
              >
                <div className="text-xs font-medium text-slate-500 px-2 py-1">
                  Department
                </div>
                {(data?.competencies || []).map((comp) => (
                  <div
                    key={comp}
                    className="text-[10px] font-medium text-slate-500 px-2 py-1 text-center truncate"
                    title={comp}
                  >
                    {comp.length > 20 ? comp.substring(0, 18) + "..." : comp}
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {filteredDepts.map((dept, deptIdx) => (
                <motion.div
                  key={dept}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: deptIdx * 0.05 }}
                  className="grid gap-2 mb-2"
                  style={{
                    gridTemplateColumns: `180px repeat(${data?.competencies.length || 0}, 1fr)`,
                  }}
                >
                  <div className="text-xs font-medium text-slate-700 px-2 py-2 truncate bg-white rounded-xl border border-slate-100 flex items-center" title={dept}>
                    {dept}
                  </div>
                  {(data?.competencies || []).map((comp) => {
                    const cell = cellsByDept
                      .get(dept)
                      ?.find((c) => c.competency === comp);
                    return (
                      <div
                        key={comp}
                        className={`rounded-xl border px-2 py-2 text-center text-[11px] font-medium cursor-default transition-all hover:scale-105 ${
                          cell ? LEVEL_BG[cell.level] : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}
                        onMouseEnter={() => cell && setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={
                          cell
                            ? `${cell.department} — ${cell.competency}\nAvg: ${cell.avgScore}% (${cell.level})\nUsers: ${cell.userCount}`
                            : "No data"
                        }
                      >
                        {cell ? `${cell.avgScore}%` : "—"}
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hovered cell details */}
          {hoveredCell && (
            <ClayCard className="p-4 flex items-center gap-4">
              <div
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  LEVEL_COLORS[hoveredCell.level]
                }`}
              >
                {hoveredCell.level.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">
                  {hoveredCell.department} — {hoveredCell.competency}
                </p>
                <p className="text-xs text-slate-500">
                  Average score: {hoveredCell.avgScore}% · Based on{" "}
                  {hoveredCell.userCount} user(s)
                </p>
              </div>
            </ClayCard>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <ClayCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
        </div>
      </div>
    </ClayCard>
  );
}

export default function HeatmapPage() {
  return (
    <RequireAuth>
      <HeatmapContent />
    </RequireAuth>
  );
}
