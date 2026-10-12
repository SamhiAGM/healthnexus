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
  ExternalLink,
  Building2
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0B1730] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              HealthNexus (LankaCare.me) is an intelligent, integrated healthcare management platform uniting patient clinic queues, role-based clinician workflows, and a nationwide Sri Lankan hospital directory.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium bg-teal-950/40 border border-teal-800/40 px-3 py-1.5 rounded-md w-fit">
              <ShieldCheck className="w-4 h-4" />
              Verified MoH 2026 Directory • Secure Role-Based Access
            </div>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Patient Care & Directory
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/hospitals" className="hover:text-teal-400 transition-colors flex items-center gap-1.5 font-medium text-teal-300">
                  <Building2 className="w-3.5 h-3.5" />
                  Hospital Directory
                </Link>
              </li>
              <li>
                <Link href="/hospitals?q=Kinniya" className="hover:text-teal-400 transition-colors text-slate-400">
                  Base Hospital Kinniya
                </Link>
              </li>
              <li>
                <Link href="/auth/patient-register" className="hover:text-teal-400 transition-colors">
                  Patient Registration (OTP)
                </Link>
              </li>
              <li>
                <Link href="/auth/patient-login" className="hover:text-teal-400 transition-colors">
                  Patient Portal Login
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-teal-400 transition-colors">
                  How HealthNexus Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Healthcare Staff Workspaces */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Clinical & Operations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/auth/staff-login" className="hover:text-teal-400 transition-colors">
                  Staff Login (Enforced MFA)
                </Link>
              </li>
              <li>
                <Link href="/auth/staff-register" className="hover:text-teal-400 transition-colors">
                  Staff Credential Registration
                </Link>
              </li>
              <li>
                <Link href="/portal/doctor" className="hover:text-teal-400 transition-colors">
                  Doctor Consultation Desk
                </Link>
              </li>
              <li>
                <Link href="/portal/nurse" className="hover:text-teal-400 transition-colors">
                  Nursing Triage Station
                </Link>
              </li>
              <li>
                <Link href="/portal/admin" className="hover:text-teal-400 transition-colors">
                  Hospital Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Support & Helplines
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>1990 Suwasariya Emergency</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-mono text-xs text-slate-300">Healthnexus.support@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Colombo & Provincial Hubs, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 HealthNexus (LankaCare.me). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/#privacy" className="hover:text-slate-300 transition-colors">Privacy Notice</Link>
            <Link href="/#terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/hospitals" className="hover:text-slate-300 transition-colors">Ministry of Health 2026 Registry</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
