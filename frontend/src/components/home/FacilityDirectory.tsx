"use client";

import React from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Compass
} from "lucide-react";
import { getFeaturedHospitals, Hospital } from "@/lib/hospitalData";

export function FacilityDirectory() {
  const featuredFacilities: Hospital[] = getFeaturedHospitals();

  return (
    <section id="facilities" className="py-24 bg-[#F0F4F7] text-[#364A5D] relative overflow-hidden border-t border-[#D9E3E9]">
      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#159B94]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#426DA9]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DFEFEC] border border-[#159B94]/30 text-[#087F79] text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#087F79]" />
            Accredited Public Hospital Network
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#20364C] tracking-tight">
            Featured Sri Lankan Healthcare Institutions
          </h2>
          <p className="text-[#43566C] text-base sm:text-lg leading-relaxed">
            Discover tertiary hospitals, provincial centers, and regional base hospitals verified against the official Ministry of Health Sri Lanka 2026 directory.
          </p>
        </div>

        {/* Featured Hospital Cards Grid (Limited to 3-4 on home page) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredFacilities.slice(0, 3).map((fac) => {
            const isKinniya = fac.id === "base-hospital-kinniya";
            return (
              <div
                key={fac.id}
                className={`bg-[#F8FAFB] rounded-2xl border transition-all duration-300 flex flex-col justify-between p-6 shadow-xs hover:shadow-md hover:-translate-y-1 ${
                  isKinniya
                    ? "border-[#159B94] ring-1 ring-[#159B94]/30 hover:border-[#087F79]"
                    : "border-[#D9E3E9] hover:border-[#159B94]/50"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#087F79] bg-[#DFEFEC] border border-[#159B94]/30 px-2.5 py-1 rounded-full">
                      {fac.district} &bull; {fac.province}
                    </span>
                    <span className="text-[11px] font-semibold text-[#426DA9] bg-[#E8F0F4] border border-[#426DA9]/30 px-2.5 py-0.5 rounded-full">
                      {fac.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#20364C] mb-1">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-[#43566C] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#159B94] shrink-0" />
                      <span>{fac.city}, {fac.district} District</span>
                    </p>
                  </div>

                  {/* Clinics */}
                  <div>
                    <div className="text-xs font-semibold text-[#43566C] mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#087F79]" />
                      Key Clinical Services:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {fac.featuredClinics.slice(0, 3).map((clinic) => (
                        <span
                          key={clinic}
                          className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#F0F4F7] text-[#364A5D] border border-[#D9E3E9]"
                        >
                          {clinic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-5 mt-5 border-t border-[#D9E3E9] flex items-center justify-between text-xs">
                  <a
                    href={`tel:${fac.phone}`}
                    className="flex items-center gap-1.5 text-[#43566C] hover:text-[#087F79] font-medium transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#087F79]" />
                    <span className="font-mono">{fac.phone}</span>
                  </a>

                  <Link
                    href={`/hospitals`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#DFEFEC] hover:bg-[#c9e8e2] text-[#087F79] font-semibold transition-all border border-[#159B94]/30"
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
        <div className="bg-gradient-to-r from-[#087F79] via-[#159B94] to-[#426DA9] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#DFEFEC] text-xs font-medium backdrop-blur-md">
              <Compass className="w-3.5 h-3.5" />
              <span>Nationwide Sri Lanka Healthcare Coverage</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Looking for a Specific District or Base Hospital?
            </h3>
            <p className="text-[#DFEFEC] text-sm leading-relaxed">
              Explore the nationwide verified database with advanced search, province filtering, contact numbers, and direct location maps.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/hospitals"
              className="px-6 py-3.5 bg-white hover:bg-[#F8F7F3] text-[#087F79] font-bold text-sm rounded-xl shadow-lg hover:shadow-white/20 transition-all flex items-center gap-2 group"
            >
              <span>Explore All 40+ Public Hospitals</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Public Data Transparency Note */}
        <div className="mt-8 text-center text-xs text-[#43566C] max-w-2xl mx-auto">
          <p>
            Official directory records published from Ministry of Health (MoH) Sri Lanka 2026 ledgers. Inclusion does not imply commercial partnership or endorsement.
          </p>
        </div>

      </div>
    </section>
  );
}
