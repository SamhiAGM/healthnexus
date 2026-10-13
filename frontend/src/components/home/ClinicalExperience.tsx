"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Stethoscope, 
  Activity, 
  Heart, 
  Users, 
  ArrowRight, 
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Lock
} from "lucide-react";

export function ClinicalExperience() {
  return (
    <section className="py-24 bg-[#E7EFF1] text-[#3C5262] relative overflow-hidden border-t border-[#D5E0E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Clinical Copy & Capabilities */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#467DA3] bg-[#DFEAF0] border border-[#467DA3]/30 px-3.5 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#467DA3]" />
              Clinician &amp; Nursing Station Workflows
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
              Purpose-Built for Doctors, Nurses &amp; Hospital Teams
            </h2>

            <p className="text-[#3C5262] text-base leading-relaxed">
              Designed hand-in-hand with clinical staff to eliminate paper record delays. Doctors review pre-consultation vitals taken by nurses, record treatment plans, dispatch electronic prescriptions, and coordinate laboratory orders with a single click.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-[#243847]">
                  <Stethoscope className="w-4 h-4 text-[#108B83]" />
                  <span>Physician Worklist</span>
                </div>
                <p className="text-xs text-[#667986] leading-relaxed">
                  Call next patient, review pre-recorded vitals, and log clinical diagnosis with zero lag.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-[#243847]">
                  <Heart className="w-4 h-4 text-[#C97972]" />
                  <span>Nursing Triage</span>
                </div>
                <p className="text-xs text-[#667986] leading-relaxed">
                  Fast blood pressure, SpO2, and pulse logging with automatic clinical acuity prioritization.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-[#243847]">
                  <ClipboardList className="w-4 h-4 text-[#467DA3]" />
                  <span>Multidisciplinary Review</span>
                </div>
                <p className="text-xs text-[#667986] leading-relaxed">
                  Seamless referral handoffs between OPD, specialty clinics, pharmacy, and diagnostic labs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-[#243847]">
                  <Lock className="w-4 h-4 text-[#08786F]" />
                  <span>SLMC Credentialing</span>
                </div>
                <p className="text-xs text-[#667986] leading-relaxed">
                  Strict administrator approval and verified medical council registration before access.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/staff-login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#467DA3] hover:bg-[#3b6b8d] text-white font-bold text-sm shadow-xs transition transform hover:-translate-y-0.5"
              >
                <span>Enter Staff Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/staff-register"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#FAFBFA] hover:bg-white text-[#243847] border border-[#D5E0E3] font-bold text-sm transition"
              >
                <span>Register Staff Credentials</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Visual Composite with Generated Images */}
          <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
            
            {/* Image 1: Nurse care coordination */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D5E0E3] shadow-md group">
              <div className="relative h-64 sm:h-72 w-full">
                <Image
                  src="/images/nurse_care_coord.jpg"
                  alt="Sri Lankan Nurse Coordinating Digital Patient Triage in Hospital Ward"
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute bottom-3 left-3 bg-[#FAFBFA]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D5E0E3] text-[11px] font-bold text-[#243847]">
                Station Triage &bull; Acute Vital Prioritization
              </div>
            </div>

            {/* Image 2: Staff collaboration */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D5E0E3] shadow-md group">
              <div className="relative h-56 sm:h-64 w-full">
                <Image
                  src="/images/staff_collaboration.jpg"
                  alt="Sri Lankan Healthcare Team Collaborating around Patient Care Plan Display"
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute bottom-3 left-3 bg-[#FAFBFA]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D5E0E3] text-[11px] font-bold text-[#243847]">
                Multidisciplinary Case Planning &bull; Patient Care Coordination
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
