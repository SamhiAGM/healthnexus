"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { getFeaturedHospitals, Hospital } from "@/lib/hospitalData";

export function FacilityDirectory() {
  const featuredFacilities: Hospital[] = getFeaturedHospitals();

  return (
    <section id="facilities" className="py-24 bg-[#F8FAFC] text-[#172B4D] relative overflow-hidden border-t border-[#E2E8F0]">
      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Accredited Public Hospital Network
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B4D] tracking-tight">
            Featured Sri Lankan Healthcare Institutions
          </h2>
          <p className="text-[#52657F] text-base sm:text-lg leading-relaxed">
            Discover tertiary hospitals, provincial centers, and regional base hospitals verified against the official Ministry of Health Sri Lanka 2026 directory.
          </p>
        </div>

        {/* Featured Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredFacilities.map((fac) => {
            const isKinniya = fac.id === "base-hospital-kinniya";
            return (
              <div
                key={fac.id}
                className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 ${
                  isKinniya
                    ? "border-[#14B8A6] ring-1 ring-[#14B8A6]/30 hover:border-[#0F766E]"
                    : "border-[#E2E8F0] hover:border-teal-500/40"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                      {fac.district} &bull; {fac.province}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {fac.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#172B4D] mb-1">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-[#52657F] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{fac.city}, {fac.district} District</span>
                    </p>
                  </div>

                  {/* Clinics */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      Key Clinical Services:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {fac.featuredClinics.slice(0, 3).map((clinic) => (
                        <span
                          key={clinic}
                          className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#F8FAFC] text-slate-700 border border-[#E2E8F0]"
                        >
                          {clinic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-5 mt-5 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <a
                    href={`tel:${fac.phone}`}
                    className="flex items-center gap-1.5 text-[#52657F] hover:text-[#0F766E] font-medium transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span className="font-mono">{fac.phone}</span>
                  </a>

                  <Link
                    href={`/hospitals`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-semibold transition-all border border-teal-200"
                  >
                    <span>View In Directory</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* PROMINENT "EXPLORE ALL HOSPITALS" CTA BANNER */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-blue-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-medium backdrop-blur-md">
              <Compass className="w-3.5 h-3.5" />
              <span>Nationwide Sri Lanka Healthcare Coverage</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Looking for a Specific District or Base Hospital?
            </h3>
            <p className="text-teal-100 text-sm leading-relaxed">
              Explore the nationwide verified database with advanced search, province filtering, contact numbers, and direct location maps.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/hospitals"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-[#0F766E] font-bold text-sm rounded-xl shadow-lg hover:shadow-white/20 transition-all flex items-center gap-2 group"
            >
              <span>Explore All 40+ Public Hospitals</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Public Data Transparency Note */}
        <div className="mt-8 text-center text-xs text-[#52657F] max-w-2xl mx-auto">
          <p>
            Official directory records published from Ministry of Health (MoH) Sri Lanka 2026 ledgers. Inclusion does not imply commercial partnership or endorsement.
          </p>
        </div>

      </div>
    </section>
  );
}
