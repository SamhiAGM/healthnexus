"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Cpu, 
  Database, 
  Server, 
  Network, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Radio,
  FileCheck2
} from "lucide-react";

export function TechnologySection() {
  return (
    <section id="technology" className="py-24 bg-[#EDF2F4] text-[#3C5262] relative overflow-hidden border-t border-[#D5E0E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#108B83] bg-[#DDEFE9] border border-[#108B83]/30 px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
            National Healthcare Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
            Digital Healthcare Technology for Sri Lanka
          </h2>
          <p className="text-[#667986] text-base sm:text-lg">
            Engineered with modern full-stack reliability: Next.js 16 frontend, Spring Boot 3.4.3 microservices, MongoDB Atlas persistence, and enterprise-grade health telemetry.
          </p>
        </div>

        {/* Feature Grid with Hospital Operations Command Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-14">
          
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-[#D5E0E3] shadow-md group">
            <div className="relative h-80 sm:h-96 w-full">
              <Image
                src="/images/hospital_tech_connected.jpg"
                alt="Hospital Operations Command Center Monitoring Sri Lankan Healthcare Analytics"
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#FAFBFA]/95 backdrop-blur-md rounded-2xl p-4 border border-[#D5E0E3] shadow-md flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#243847]">National Telemetry &bull; Real-Time Capacity Monitoring</div>
                <div className="text-[11px] text-[#667986]">Aggregating outpatient loads across provincial &amp; base facilities</div>
              </div>
              <span className="text-xs font-bold text-[#08786F] bg-[#DDEFE9] px-2.5 py-1 rounded-full border border-[#108B83]/30">
                MoH 2026 Ready
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#243847]">
                <Server className="w-4 h-4 text-[#108B83]" />
                <span>Spring Boot 3.4 &amp; Java 21 Engine</span>
              </div>
              <p className="text-xs text-[#667986] leading-relaxed">
                High-throughput reactive microservice backend running on Azure App Service with strict thread-isolated security filters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#243847]">
                <Database className="w-4 h-4 text-[#467DA3]" />
                <span>Encrypted MongoDB Atlas Clusters</span>
              </div>
              <p className="text-xs text-[#667986] leading-relaxed">
                Multi-region document persistence with field-level encryption, automated snapshots, and strict access control.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#243847]">
                <Radio className="w-4 h-4 text-[#C97972]" />
                <span>1990 Suwa Seriya Integration Hook</span>
              </div>
              <p className="text-xs text-[#667986] leading-relaxed">
                Emergency escalation protocol directing acute cases immediately to the national pre-hospital ambulance hotline.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#243847]">
                <Network className="w-4 h-4 text-[#08786F]" />
                <span>Zero Client-Storage Token Leaks</span>
              </div>
              <p className="text-xs text-[#667986] leading-relaxed">
                Authenticated session tokens are stored exclusively in HttpOnly, SameSite, SSL-enforced server cookies.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
