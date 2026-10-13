"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  User, 
  Stethoscope, 
  Heart, 
  ClipboardCheck, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Activity, 
  Ticket 
} from "lucide-react";

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<"patient" | "doctor" | "nurse" | "supervisor" | "admin">("patient");

  const previews = {
    patient: {
      title: "Patient Care Portal",
      role: "Public Citizen",
      link: "/portal/patient",
      actionText: "Launch Patient Portal",
      color: "border-[#108B83]/40 text-[#08786F]",
      description: "Book hospital clinic appointments, track live digital queue tickets, and receive follow-up reminders.",
      stats: [
        { label: "Active Queue Ticket", value: "C-024", sub: "Serving: C-020 (12m wait)" },
        { label: "Confirmed Clinic", value: "Cardiology Room 04", sub: "National Hospital of Sri Lanka" },
        { label: "Care Reminders", value: "2 Reminders", sub: "Prescription refill & ECG" },
      ],
      highlights: [
        "Live queue countdown eliminating waiting room congestion",
        "Assisted guardian booking for dependents and elderly family",
        "Encrypted National Identity Card (NIC) privacy protection",
      ],
    },
    doctor: {
      title: "Clinician & Doctor Workspace",
      role: "Consultant / Medical Doctor",
      link: "/portal/doctor",
      actionText: "Launch Doctor Workspace",
      color: "border-[#467DA3]/40 text-[#467DA3]",
      description: "Structured patient worklists, real-time consultation recorder, triage vitals review, and diagnostic lab orders.",
      stats: [
        { label: "Today's Patient Queue", value: "28 Consultations", sub: "Morning Outpatient Session" },
        { label: "Active Consulting", value: "Token C-020", sub: "Hypertension Review" },
        { label: "Diagnostic Dispatches", value: "14 Orders", sub: "12-lead ECG, HbA1c, Lipids" },
      ],
      highlights: [
        "One-click queue control: Call, Consult, and Complete",
        "Pre-consultation triage vitals recorded by nursing staff",
        "Integrated hospital pharmacy and laboratory test dispatches",
      ],
    },
    nurse: {
      title: "Nursing Station & Triage",
      role: "Staff Nurse / Triage Desk",
      link: "/portal/nurse",
      actionText: "Launch Nursing Station",
      color: "border-[#E5E5F2] text-[#698399]",
      description: "Fast-track vitals measurement, acuity level triage assignment, and clinical handover coordination.",
      stats: [
        { label: "Patients Waiting Vitals", value: "6 Arrived", sub: "Station Desk A" },
        { label: "Average Triage Time", value: "2.8 Minutes", sub: "Blood Pressure, Pulse, SpO2" },
        { label: "Priority Escalations", value: "1 Urgent", sub: "Expedited to Consultant" },
      ],
      highlights: [
        "Digital vital measurement logging (BP, Pulse, Temp, SpO2)",
        "Automated priority flagging for acute vital abnormalities",
        "Instant record forwarding to doctor consultation worklist",
      ],
    },
    supervisor: {
      title: "Digital Field Supervision",
      role: "Field Supervision Officer",
      link: "/portal/supervisor",
      actionText: "Launch Supervision Desk",
      color: "border-[#108B83]/40 text-[#08786F]",
      description: "Institutional audit checklists, deficiency findings, and verified corrective-action tracking workflows.",
      stats: [
        { label: "Institutional Audits", value: "8 Facilities", sub: "Western & Central Province" },
        { label: "Active Corrective Actions", value: "3 In-Progress", sub: "Cold Chain, Sterilization" },
        { label: "Verification Rate", value: "94% Closed", sub: "Ministry Quality Criteria" },
      ],
      highlights: [
        "Dynamic mobile-ready checklist surveys for hospital facilities",
        "Corrective action lifecycle: Open → In Progress → Verified Closed",
        "Digital audit history preventing repeated non-compliance",
      ],
    },
    admin: {
      title: "Hospital Administration",
      role: "Executive Hospital Administrator",
      link: "/portal/admin",
      actionText: "Launch Admin Dashboard",
      color: "border-[#467DA3]/40 text-[#467DA3]",
      description: "Clinic session quota management, medical staff verification approval, and operational throughput monitoring.",
      stats: [
        { label: "Facility Attendance", value: "439 Patients", sub: "84% Daily Quota Utilized" },
        { label: "On-Duty Medical Staff", value: "32 Clinicians", sub: "Across 6 Outpatient Wings" },
        { label: "Pending Staff Approvals", value: "2 Verifications", sub: "SLMC / SLNC Validations" },
      ],
      highlights: [
        "Professional registration verification before clinical privilege access",
        "Dynamic daily clinic capacity quotas per specialized department",
        "Aggregated operations metrics and facility throughput reports",
      ],
    },
  };

  const active = previews[activeTab];

  return (
    <section className="py-24 bg-[#E7EFF1] text-[#3C5262] relative overflow-hidden border-t border-[#D5E0E3]">
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#467DA3]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#108B83]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
            Interactive Platform Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
            Tailored Workspaces for Every Healthcare Role
          </h2>
          <p className="text-[#667986] text-base sm:text-lg">
            Experience how HealthNexus LK connects citizens, clinicians, and hospital administrators through unified role-based dashboards.
          </p>
        </div>

        {/* Tab Buttons Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "patient", label: "Patient Portal", icon: User },
            { id: "doctor", label: "Doctor Workspace", icon: Stethoscope },
            { id: "nurse", label: "Nursing Station", icon: Heart },
            { id: "supervisor", label: "Field Supervision", icon: ClipboardCheck },
            { id: "admin", label: "Hospital Admin", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  isCurrent
                    ? "bg-[#FAFBFA] text-[#243847] border-[#108B83] shadow-xs ring-1 ring-[#108B83]/30 font-bold"
                    : "bg-[#EDF2F4] text-[#698399] hover:text-[#243847] border-[#D5E0E3]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? "text-[#108B83]" : "text-[#698399]"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Preview Container */}
        <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-10 shadow-xs space-y-8 animate-in fade-in-50 duration-200">
          
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D5E0E3] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#108B83]">
                  {active.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-[#E7EFF1] text-[#698399] border border-[#D5E0E3]">
                  Demonstration Preview
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#243847] tracking-tight">
                {active.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#667986] mt-1 max-w-2xl">
                {active.description}
              </p>
            </div>

            <Link
              href={active.link}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#108B83] hover:bg-[#08786F] text-white text-xs sm:text-sm font-bold transition-all shadow-xs self-start md:self-auto"
            >
              <span>{active.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Metric Cards Mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {active.stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] space-y-1 shadow-2xs"
              >
                <span className="text-xs font-semibold text-[#698399]">{stat.label}</span>
                <div className="text-2xl font-extrabold text-[#243847] mt-1">{stat.value}</div>
                <span className="text-[11px] text-[#108B83] font-semibold block">{stat.sub}</span>
              </div>
            ))}
          </div>

          {/* Highlights Checklist */}
          <div className="p-5 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30">
            <span className="text-xs font-bold text-[#08786F] uppercase tracking-wider block mb-3">
              Standard Clinical &amp; Governance Capabilities
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#243847]">
              {active.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#108B83] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
