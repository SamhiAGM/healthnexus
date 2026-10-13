"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  EyeOff, 
  FileCheck, 
  Fingerprint,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function SecurityOverview() {
  const securityFeatures = [
    {
      title: "Zero Plaintext Credentials",
      desc: "Passwords and sensitive credentials are salted and hashed using cryptographic standards before database persistence.",
      icon: KeyRound,
      color: "text-[#108B83] bg-[#DDEFE9]",
    },
    {
      title: "HttpOnly Session Cookies",
      desc: "Authentication proofs are never stored in browser localStorage or sessionStorage, completely mitigating XSS token theft.",
      icon: Lock,
      color: "text-[#467DA3] bg-[#DFEAF0]",
    },
    {
      title: "NIC Token Pseudonymization",
      desc: "Sri Lankan National Identity Card (NIC) numbers are hashed with one-way salts to protect citizen identity privacy.",
      icon: EyeOff,
      color: "text-[#08786F] bg-[#DDEFE9]",
    },
    {
      title: "Server-Enforced 11-Role RBAC",
      desc: "Every API endpoint enforces strict role-based access control inside Spring Security, preventing privilege escalation.",
      icon: ShieldCheck,
      color: "text-[#467DA3] bg-[#E5E5F2]",
    },
    {
      title: "Time-Limited 5-Min OTPs",
      desc: "Registration and password recovery OTPs expire automatically within 5 minutes, with server-side rate limits on resends.",
      icon: Fingerprint,
      color: "text-[#C97972] bg-[#FAFBFA]",
    },
    {
      title: "Immutable Clinical Audit Trails",
      desc: "Every record inspection, queue change, and clinical consultation logs an immutable audit stamp with timestamp and user ID.",
      icon: FileCheck,
      color: "text-[#108B83] bg-[#DDEFE9]",
    },
  ];

  return (
    <section className="py-24 bg-[#E7EFF1] text-[#3C5262] relative overflow-hidden border-t border-[#D5E0E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
            Enterprise Patient Protection
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
            Security &amp; Privacy at Every Touchpoint
          </h2>
          <p className="text-[#667986] text-base sm:text-lg">
            Healthcare data requires the highest level of vigilance. HealthNexus LK enforces strict defense-in-depth across frontend, backend, and database tiers.
          </p>
        </div>

        {/* Security Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] hover:border-[#108B83] hover:shadow-md transition-all duration-300 shadow-2xs space-y-3"
              >
                <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center font-bold shadow-xs`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#243847]">{feat.title}</h3>
                <p className="text-xs text-[#667986] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
