import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FacilityDirectory } from "@/components/home/FacilityDirectory";
import { OperationalMetrics } from "@/components/home/OperationalMetrics";
import { DashboardPreview } from "@/components/home/DashboardPreview";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172B4D] selection:bg-teal-500 selection:text-white">
      {/* Sticky Responsive Navigation Bar */}
      <Navbar />

      {/* Main Cinematic Landing Page */}
      <main className="flex-grow">
        {/* Cinematic Hero */}
        <Hero />

        {/* Healthcare Services Explorer */}
        <ServicesSection />

        {/* Visual Timeline of Patient Journey */}
        <HowItWorks />

        {/* Hospital & Active Clinics Directory */}
        <FacilityDirectory />

        {/* Interactive Multi-Role Platform Preview */}
        <DashboardPreview />

        {/* Real-time Data Visualization & Operational Charts */}
        <OperationalMetrics />

        {/* Frequently Asked Questions */}
        <FAQSection />

        {/* Inquiries & Emergency Escalation */}
        <ContactSection />
      </main>

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
}
