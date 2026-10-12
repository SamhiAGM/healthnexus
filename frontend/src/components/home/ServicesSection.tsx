"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  Calendar, 
  Activity, 
  UserCheck, 
  ClipboardCheck, 
  Stethoscope, 
  Pill, 
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      id: "facilities",
      title: "Find Hospitals & Clinics",
      description: "Search accredited Sri Lankan tertiary, provincial, and divisional healthcare facilities by district and active clinic sessions.",
      icon: Building2,
      badge: "Public Access",
      href: "/hospitals",
      color: "from-teal-50 to-teal-100/60 text-teal-700 border-teal-200",
    },
    {
      id: "appointments",
      title: "Clinic Appointments",
      description: "Request clinic visits, select confirmed morning or afternoon slots, and receive automated schedule alerts.",
      icon: Calendar,
      badge: "Patient Portal",
      href: "/auth/patient-register",
      color: "from-blue-50 to-blue-100/60 text-blue-700 border-blue-200",
    },
    {
      id: "queues",
      title: "Digital Queue Tracking",
      description: "Real-time queue ticket status. Monitor current token numbers, estimated wait countdowns, and room routing.",
      icon: Activity,
      badge: "Real-Time Tracking",
      href: "/auth/patient-login",
      color: "from-amber-50 to-amber-100/60 text-amber-700 border-amber-200",
    },
    {
      id: "clinical",
      title: "Clinician Worklist",
      description: "Structured patient queues, consultation recording, referral coordination, and diagnostic lab dispatches for doctors.",
      icon: Stethoscope,
      badge: "Physicians & Consultants",
      href: "/auth/staff-login",
      color: "from-teal-50 to-teal-100/60 text-teal-700 border-teal-200",
    },
    {
      id: "nursing-reception",
      title: "Reception & Nursing Triage",
      description: "Assisted walk-in check-in, priority class allocation, automated vitals logging, and clinical handovers.",
      icon: UserCheck,
      badge: "Staff Desk & Station",
      href: "/auth/staff-login",
      color: "from-purple-50 to-purple-100/60 text-purple-700 border-purple-200",
    },
    {
      id: "supervision",
      title: "Field Supervision & Audits",
      description: "Digitized inspection checklists, institutional finding tracking, and verified corrective-action workflows.",
      icon: ClipboardCheck,
      badge: "Supervisors & Quality",
      href: "/auth/staff-login",
      color: "from-rose-50 to-rose-100/60 text-rose-700 border-rose-200",
    },
    {
      id: "pharmacy-lab",
      title: "Pharmacy & Lab Dispatches",
      description: "Track medication dispensation orders and diagnostic laboratory investigations with zero paper bottlenecks.",
      icon: Pill,
      badge: "Ancillary Healthcare",
      href: "/auth/staff-login",
      color: "from-emerald-50 to-emerald-100/60 text-emerald-700 border-emerald-200",
    },
    {
      id: "issues",
      title: "Operational Issue Reporting",
      description: "Report facility maintenance, equipment readiness, or accessibility barriers with complete ticket audit trails.",
      icon: FileText,
      badge: "Facility Support",
      href: "#contact",
      color: "from-sky-500/20 to-sky-500/5 text-sky-700 border-sky-200",
    },
  ];

  return (
    <section id="services" className="py-24 bg-[#F8FAFC] text-[#172B4D] relative overflow-hidden">
      
      {/* Background Lighting Accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Comprehensive Healthcare Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Every Stakeholder in Sri Lankan Healthcare
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            From rural outpatient clinics to major teaching hospitals, HealthNexus LK connects citizens with dedicated healthcare teams.
          </p>
        </div>

        {/* Highlight Feature Showcase Card with Hospital Photography */}
        <div className="mb-14 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-700">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Collaborative Clinical Workflows
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Streamlined Doctor-Patient Consultations & Hospital Triage
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Empowering healthcare practitioners with instant visibility into patient queue tickets, logged vital measurements, medication dispenses, and specialized departmental referrals.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/auth/staff-login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Enter Clinician Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/auth/patient-register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                >
                  Patient Online Registration
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <Image
                src="/images/doctor_consult_card.jpg"
                alt="Healthcare Professionals Collaborating in Clinical Workspace"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center filter brightness-[0.95] contrast-[1.05] hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-[11px] font-medium text-slate-800 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                Connected Clinical Station • Teaching & Base Hospitals
              </div>
            </div>

          </div>
        </div>

        {/* Service Cards Grid with Refined Micro-Elevations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-white hover:bg-[#F6F9FC] border border-slate-200 hover:border-teal-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center transform group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 group-hover:text-teal-800 transition-colors"
                  >
                    <span>Open Service</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
