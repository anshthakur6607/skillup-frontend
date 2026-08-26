/**
 * Home page — Server component that renders the landing page.
 * The landing sections are client components (they use framer-motion),
 * but this page itself is a server component for optimal performance.
 */
import { Navbar, Hero, StatsSection, FeatureGrid, HowItWorks, Footer } from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Hero />
      <StatsSection />
      <FeatureGrid />
      <HowItWorks />
      <Footer />
    </div>
  );
}
