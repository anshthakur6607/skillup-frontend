"use client";
/**
 * StatsSection — real platform capabilities, not fake numbers.
 * Shows what SkillUp actually does rather than made-up statistics.
 */
import { Database, BookOpen, Users, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";



export function StatsSection() {
  const { t } = useLanguage();
  const stats = [
    {
      icon: Database,
      label: t("stat_officials"),
      description: "Structured mapping across statistical, technical, and behavioural domains",
    },
    {
      icon: BookOpen,
      label: t("stat_skills"),
      description: "Seamless connection to India's national learning platform for government officials",
    },
    {
      icon: Users,
      label: t("stat_domains"),
      description: "Personalised learning journeys for employees, managers, and administrators",
    },
    {
      icon: Shield,
      label: t("stat_trust"),
      description: "Row-level security, encrypted data, and compliance with government standards",
    },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-100 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <stat.icon size={20} className="text-primary-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm mb-1">
                  {stat.label}
                </div>
                <div className="text-slate-500 text-xs leading-relaxed">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
