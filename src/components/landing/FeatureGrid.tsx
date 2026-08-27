"use client";
/**
 * FeatureGrid — core platform capabilities displayed as clean cards.
 * Uses lucide-react icons. Hover lift for the clay feel.
 */
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  Award,
  Settings,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Skill Gap Analysis",
    description:
      "AI-driven assessment identifies where each official stands against the competency framework and highlights priority gaps.",
  },
  {
    icon: BookOpen,
    title: "Personalised Learning",
    description:
      "Curated course recommendations from iGOT Karmayogi and internal training resources, matched to individual skill gaps.",
  },
  {
    icon: MessageSquare,
    title: "AI Tutor",
    description:
      "An embedded chatbot that answers questions, explains concepts, and guides officials through learning materials at their own pace.",
  },
  {
    icon: ClipboardCheck,
    title: "Adaptive Assessments",
    description:
      "Dynamic question difficulty based on responses, with detailed breakdowns showing where understanding breaks down.",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description:
      "Tamper-proof digital certificates with verification hashes, linked to competency achievements and course completions.",
  },
  {
    icon: Settings,
    title: "Admin Analytics",
    description:
      "Department-level dashboards for managers and administrators to track organisational skill health and training progress.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Built for capacity building at scale
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            From identifying skill gaps to issuing certificates, SkillUp covers
            the entire learning lifecycle for government institutions.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c1c9d6,-8px_-8px_16px_#ffffff] transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                <f.icon size={22} className="text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
