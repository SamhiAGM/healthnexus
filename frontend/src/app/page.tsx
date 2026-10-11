import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FacilityDirectory } from "@/components/home/FacilityDirectory";
import { OperationalMetrics } from "@/components/home/OperationalMetrics";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1730] text-slate-100 selection:bg-teal-500 selection:text-white">
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
