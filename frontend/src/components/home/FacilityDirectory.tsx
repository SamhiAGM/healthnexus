"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Compass,
  CheckCircle2
} from "lucide-react";
import { getFeaturedHospitals, Hospital } from "@/lib/hospitalData";

export function FacilityDirectory() {
  const featuredFacilities: Hospital[] = getFeaturedHospitals();

  return (
    <section id="facilities" className="py-24 bg-[#EDF2F4] text-[#3C5262] relative overflow-hidden border-t border-[#D5E0E3]">
      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#108B83]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#467DA3]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDEFE9] border border-[#108B83]/30 text-[#08786F] text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
            Accredited Public Hospital Network
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
            Featured Sri Lankan Healthcare Institutions
          </h2>
          <p className="text-[#667986] text-base sm:text-lg leading-relaxed">
            Discover tertiary hospitals, provincial centers, and regional base hospitals verified against the official Ministry of Health Sri Lanka 2026 directory.
          </p>
        </div>

        {/* Featured Hospital Cards Grid (Limited to 3 featured facilities on homepage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredFacilities.slice(0, 3).map((fac) => {
            const isKinniya = fac.id === "base-hospital-kinniya";
            return (
              <div
                key={fac.id}
                className={`bg-[#FAFBFA] rounded-3xl border transition-all duration-300 flex flex-col justify-between p-6 shadow-2xs hover:shadow-md hover:-translate-y-1 ${
                  isKinniya
                    ? "border-[#108B83] ring-1 ring-[#108B83]/30 hover:border-[#08786F]"
                    : "border-[#D5E0E3] hover:border-[#108B83]/50"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-2.5 py-1 rounded-full">
                      {fac.district} &bull; {fac.province}
                    </span>
                    <span className="text-[11px] font-semibold text-[#467DA3] bg-[#DFEAF0] border border-[#467DA3]/30 px-2.5 py-0.5 rounded-full">
                      {fac.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#243847] mb-1">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-[#667986] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#108B83] shrink-0" />
                      <span>{fac.city}, {fac.district} District</span>
                    </p>
                  </div>

                  {/* Clinics */}
                  <div>
                    <div className="text-xs font-semibold text-[#667986] mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#108B83]" />
                      Key Clinical Services:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {fac.featuredClinics.slice(0, 3).map((clinic) => (
                        <span
                          key={clinic}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#E7EFF1] text-[#3C5262] border border-[#D5E0E3]"
                        >
                          {clinic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-5 mt-5 border-t border-[#D5E0E3] flex items-center justify-between text-xs">
                  <a
                    href={`tel:${fac.phone}`}
                    className="flex items-center gap-1.5 text-[#667986] hover:text-[#108B83] font-medium transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#108B83]" />
                    <span className="font-mono">{fac.phone}</span>
                  </a>

                  <Link
                    href={`/hospitals`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DDEFE9] hover:bg-[#cbe5dd] text-[#08786F] font-bold transition-all border border-[#108B83]/30"
                  >
                    <span>View In Directory</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* PROMINENT "EXPLORE ALL HOSPITALS" CTA BANNER WITH SRI LANKAN HOSPITAL EXTERIOR */}
        <div className="relative rounded-3xl overflow-hidden border border-[#D5E0E3] shadow-lg text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/sl_hospital_exterior.jpg"
              alt="Modern Sri Lankan Hospital Exterior with Ambulances and Emergency Entrance"
              fill
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.45] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#243847]/95 via-[#243847]/80 to-[#108B83]/80" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#DDEFE9] text-xs font-semibold backdrop-blur-md">
                <Compass className="w-3.5 h-3.5" />
                <span>Nationwide Sri Lanka Healthcare Coverage</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Looking for a Specific District or Base Hospital?
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                Explore the complete verified registry across all 9 provinces: search by facility tier, district, emergency lines, and direct contact numbers.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/hospitals"
                className="px-6 py-3.5 bg-white hover:bg-[#FAFBFA] text-[#08786F] font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 group transform hover:-translate-y-0.5"
              >
                <span>Explore All 40+ Public Hospitals</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Public Data Transparency Note */}
        <div className="mt-8 text-center text-xs text-[#667986] max-w-2xl mx-auto">
          <p>
            Official directory records published from Ministry of Health (MoH) Sri Lanka 2026 ledgers. Verified institution listings include Base Hospital Kinniya and regional healthcare institutions.
          </p>
        </div>

      </div>
    </section>
  );
}
