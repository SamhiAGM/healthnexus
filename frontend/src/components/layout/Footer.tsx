"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { 
  Heart, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Lock, 
  ArrowUpRight 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#E7EFF1] text-[#3C5262] border-t border-[#D5E0E3] selection:bg-[#108B83] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="dark" size="lg" />
            <p className="text-sm text-[#667986] max-w-sm leading-relaxed">
              HealthNexus (LankaCare.me) is Sri Lanka&apos;s unified digital healthcare network connecting citizen outpatient queues, doctor consultations, diagnostic laboratories, and government hospitals into a single intelligent platform.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#08786F] font-bold bg-[#DDEFE9] border border-[#108B83]/30 px-3.5 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-[#108B83]" />
              <span>Ministry of Health 2026 Directory &bull; Enterprise RBAC</span>
            </div>
          </div>

          {/* Patient Care & Directory */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#243847] mb-4">
              Patient Care &amp; Directory
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/hospitals" className="text-[#3C5262] hover:text-[#108B83] font-semibold transition flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#108B83]" />
                  <span>Hospital Directory (40+)</span>
                </Link>
              </li>
              <li>
                <Link href="/hospitals" className="text-[#667986] hover:text-[#108B83] transition">
                  Base Hospital Kinniya
                </Link>
              </li>
              <li>
                <Link href="/auth/patient-register" className="text-[#667986] hover:text-[#108B83] transition">
                  Patient Registration (NIC/OTP)
                </Link>
              </li>
              <li>
                <Link href="/auth/patient-login" className="text-[#667986] hover:text-[#108B83] transition">
                  Patient Portal Sign In
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-[#667986] hover:text-[#108B83] transition">
                  How Clinic Queues Work
                </Link>
              </li>
            </ul>
          </div>

          {/* Healthcare Staff Workspaces */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#243847] mb-4">
              Clinical &amp; Operations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/auth/staff-login" className="text-[#3C5262] hover:text-[#467DA3] font-semibold transition flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#467DA3]" />
                  <span>Staff Portal (MFA)</span>
                </Link>
              </li>
              <li>
                <Link href="/auth/staff-register" className="text-[#667986] hover:text-[#467DA3] transition">
                  Staff Credential Registration
                </Link>
              </li>
              <li>
                <Link href="/auth/staff-login" className="text-[#667986] hover:text-[#467DA3] transition">
                  Doctor Consultation Desk
                </Link>
              </li>
              <li>
                <Link href="/auth/staff-login" className="text-[#667986] hover:text-[#467DA3] transition">
                  Nursing Triage Station
                </Link>
              </li>
              <li>
                <Link href="/auth/staff-login" className="text-[#667986] hover:text-[#467DA3] transition">
                  Hospital Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Helplines */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#243847] mb-4">
              Emergency &amp; Support
            </h4>
            <ul className="space-y-3 text-xs text-[#667986]">
              <li className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3]">
                <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div className="font-bold text-[#243847]">1990 Suwa Seriya</div>
                  <div className="text-[11px] text-[#667986]">Free Pre-Hospital Ambulance</div>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#108B83] shrink-0" />
                <span className="font-mono text-[#243847] font-medium">Healthnexus.support@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#108B83] shrink-0 mt-0.5" />
                <span>NHSL Colombo &bull; Provincial Health Hubs, Sri Lanka</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#D5E0E3] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667986]">
          <p>© 2026 HealthNexus LK &bull; LankaCare.me. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/#technology" className="hover:text-[#243847] transition">Architecture</Link>
            <Link href="/#services" className="hover:text-[#243847] transition">Services</Link>
            <Link href="/hospitals" className="hover:text-[#243847] transition">MoH 2026 Registry</Link>
            <Link href="/auth/forgot-password" className="hover:text-[#243847] transition">Account Recovery</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
