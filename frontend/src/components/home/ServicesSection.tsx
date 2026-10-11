"use client";

import React from "react";
import Link from "next/link";
import { 
  Building2, 
  Calendar, 
  Activity, 
  UserCheck, 
  ClipboardCheck, 
  Stethoscope, 
  Pill, 
  FileText,
  ArrowRight
} from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      id: "facilities",
      title: "Find Hospitals & Clinics",
      description: "Search accredited Sri Lankan tertiary, base, and divisional healthcare facilities by district and specialized services.",
      icon: Building2,
      badge: "Public Access",
      href: "#facilities",
      color: "from-teal-500/10 to-teal-500/5 text-teal-400 border-teal-500/20",
    },
    {
      id: "appointments",
      title: "Clinic Appointments",
      description: "Request clinic visits, select confirmed time windows, and receive automated schedule notifications.",
      icon: Calendar,
      badge: "Patient Portal",
      href: "/auth/patient-register",
      color: "from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20",
    },
    {
      id: "queues",
      title: "Digital Queue Tracking",
      description: "Real-time queue ticket status updates. Check your current wait number from home or the waiting area.",
      icon: Activity,
      badge: "Real-time",
      href: "/auth/patient-login",
      color: "from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20",
    },
    {
      id: "clinical",
      title: "Clinician Worklist",
      description: "Structured patient queues, consultation recording, referral coordination, and lab orders for doctors.",
      icon: Stethoscope,
      badge: "Doctors & Clinicians",
      href: "/auth/staff-login",
      color: "from-teal-500/10 to-teal-500/5 text-teal-400 border-teal-500/20",
    },
    {
      id: "nursing-reception",
      title: "Reception & Nursing Triage",
      description: "Rapid assisted patient check-in, priority allocation, vitals logging, and nursing shift handovers.",
      icon: UserCheck,
      badge: "Staff Desk",
      href: "/auth/staff-login",
      color: "from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/20",
    },
    {
      id: "supervision",
      title: "Field Supervision & Audits",
      description: "Digitized inspection checklists, institutional finding tracking, and verified corrective-action workflows.",
      icon: ClipboardCheck,
      badge: "Supervisors & Admins",
      href: "/auth/staff-login",
      color: "from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20",
    },
    {
      id: "pharmacy-lab",
      title: "Pharmacy & Lab Dispatches",
      description: "Track medication dispensation requests and diagnostic laboratory test orders with zero paper delays.",
      icon: Pill,
      badge: "Ancillary Care",
      href: "/auth/staff-login",
      color: "from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    },
    {
      id: "issues",
      title: "Operational Issue Reporting",
      description: "Report facility maintenance, equipment readiness, or accessibility barriers with complete audit resolution.",
      icon: FileText,
      badge: "Facility Support",
      href: "#contact",
      color: "from-sky-500/10 to-sky-500/5 text-sky-400 border-sky-500/20",
    },
  ];

  return (
    <section id="services" className="py-24 bg-[#081225] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            Comprehensive Healthcare Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Every Stakeholder in Sri Lankan Healthcare
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From rural outpatient clinics to major teaching hospitals, HealthConnect LK connects citizens with dedicated healthcare teams.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#0F1E36]/80 hover:bg-[#0F1E36] border border-slate-700/60 hover:border-teal-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-teal-950/30 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/80">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 group-hover:text-teal-300 transition-colors"
                  >
                    Open Service
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
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
