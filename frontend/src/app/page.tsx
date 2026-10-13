import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PatientExperience } from "@/components/home/PatientExperience";
import { ClinicalExperience } from "@/components/home/ClinicalExperience";
import { FacilityDirectory } from "@/components/home/FacilityDirectory";
import { TechnologySection } from "@/components/home/TechnologySection";
import { DashboardPreview } from "@/components/home/DashboardPreview";
import { OperationalMetrics } from "@/components/home/OperationalMetrics";
import { SecurityOverview } from "@/components/home/SecurityOverview";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EDF2F4] text-[#3C5262] selection:bg-[#108B83] selection:text-white">
      {/* Sticky Responsive Navigation Bar */}
      <Navbar />

      {/* Main Cinematic Landing Page */}
      <main className="flex-grow">
        {/* 1. Cinematic Healthcare Hero */}
        <Hero />

        {/* 2. Comprehensive Healthcare Services Explorer */}
        <ServicesSection />

        {/* 3. Visual Journey: How HealthNexus Works */}
        <HowItWorks />

        {/* 4. Citizen & Patient Experience Showcase */}
        <PatientExperience />

        {/* 5. Healthcare Professional & Clinical Experience */}
        <ClinicalExperience />

        {/* 6. Featured Sri Lankan Hospitals & MoH Directory */}
        <FacilityDirectory />

        {/* 7. National Healthcare Technology & Telemetry */}
        <TechnologySection />

        {/* 8. Interactive Multi-Role Platform Previews */}
        <DashboardPreview />

        {/* 9. Operational Intelligence & Analytics Visualizations */}
        <OperationalMetrics />

        {/* 10. Privacy, Security & Compliance Overview */}
        <SecurityOverview />

        {/* 11. Frequently Asked Questions */}
        <FAQSection />

        {/* 12. Hospital Liaison, Inquiries & Emergency Escalation */}
        <ContactSection />
      </main>

      {/* 13. Comprehensive Footer */}
      <Footer />
    </div>
  );
}
