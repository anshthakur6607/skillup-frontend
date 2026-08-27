/**
 * Home page — Server component that renders the landing page.
 * Sections are client components (framer-motion), this page is server-rendered.
 */
import {
  Navbar,
  Hero,
  StatsSection,
  FeatureGrid,
  HowItWorks,
  About,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Hero />
      <StatsSection />
      <FeatureGrid />
      <HowItWorks />
      <About />
      <Footer />
    </div>
  );
}
