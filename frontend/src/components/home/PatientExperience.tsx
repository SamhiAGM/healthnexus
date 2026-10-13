"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Smartphone, 
  Clock, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  BellRing, 
  CheckCircle2, 
  Sparkles,
  Ticket
} from "lucide-react";

export function PatientExperience() {
  return (
    <section className="py-24 bg-[#EDF2F4] text-[#3C5262] relative overflow-hidden border-t border-[#D5E0E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual with Generated Patient Digital Care Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#D5E0E3] shadow-lg group">
              <div className="relative h-80 sm:h-96 w-full">
                <Image
                  src="/images/patient_digital_care.jpg"
                  alt="Sri Lankan Citizen Using HealthNexus Mobile Digital Queue in Hospital Lounge"
                  fill
                  loading="eager"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Overlay Glass Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#FAFBFA]/95 backdrop-blur-md rounded-2xl p-4 border border-[#D5E0E3] shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DDEFE9] flex items-center justify-center text-[#08786F]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#243847]">Mobile Queue Pass &bull; SMS Alerts</div>
                    <div className="text-[11px] text-[#667986]">No standing in crowded waiting rooms</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#108B83] bg-[#DDEFE9] px-2.5 py-1 rounded-full border border-[#108B83]/30">
                  Live Sync
                </span>
              </div>
            </div>

            {/* Floating Token Card */}
            <div className="absolute -top-4 -right-4 sm:right-6 bg-[#FAFBFA] border border-[#D5E0E3] rounded-2xl p-3.5 shadow-xl hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DFEAF0] text-[#467DA3] flex items-center justify-center font-bold">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#698399]">Your Token</div>
                <div className="text-sm font-black text-[#243847]">C-024 &bull; 12 mins</div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-3.5 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
              Citizen &amp; Patient Experience
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
              A Dignified, Transparent Journey for Every Sri Lankan Citizen
            </h2>

            <p className="text-[#3C5262] text-base leading-relaxed">
              We replace hours of exhausting waiting room congestion with clear, transparent digital notifications. Patients can relax in comfort, track queue progression live, and receive automated notifications when their consultation is ready.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3]">
                <Clock className="w-5 h-5 text-[#108B83] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#243847]">Live Wait-Time Countdown</h4>
                  <p className="text-xs text-[#667986] mt-0.5">Transparent token status showing current consultation number and estimated waiting interval.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3]">
                <Users className="w-5 h-5 text-[#467DA3] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#243847]">Guardian &amp; Dependent Booking</h4>
                  <p className="text-xs text-[#667986] mt-0.5">Easily register and manage appointments for aging parents, infants, or family members using one account.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3]">
                <ShieldCheck className="w-5 h-5 text-[#08786F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#243847]">Sri Lankan NIC Privacy Protection</h4>
                  <p className="text-xs text-[#667986] mt-0.5">Government identity documents verified with irreversible cryptographic hashing to safeguard identity.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/patient-register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#108B83] hover:bg-[#08786F] text-white font-bold text-sm shadow-xs transition transform hover:-translate-y-0.5"
              >
                <span>Register as Patient</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/patient-login"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#FAFBFA] hover:bg-white text-[#243847] border border-[#D5E0E3] font-bold text-sm transition"
              >
                <span>Check Active Token</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
