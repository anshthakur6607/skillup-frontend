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
import { useLanguage } from "@/context/LanguageContext";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeatureGrid() {
  const { t } = useLanguage();
  const features = [
    { icon: BarChart3, title: t("feature_1_title"), description: t("feature_1_desc") },
    { icon: BookOpen, title: t("feature_2_title"), description: t("feature_2_desc") },
    { icon: MessageSquare, title: t("feature_3_title"), description: t("feature_3_desc") },
    { icon: ClipboardCheck, title: t("feature_4_title"), description: t("feature_4_desc") },
    { icon: Award, title: t("feature_5_title"), description: t("feature_5_desc") },
    { icon: Settings, title: t("feature_6_title"), description: t("feature_6_desc") },
  ];
  return (
    <section id="features" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {t("features_title")}
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t("features_desc")}
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
