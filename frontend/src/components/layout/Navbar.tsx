"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { 
  Menu, 
  X, 
  User, 
  ShieldAlert, 
  ChevronDown, 
  Calendar, 
  Building2, 
  Stethoscope, 
  HelpCircle, 
  PhoneCall,
  Activity,
  ArrowRight,
  Sparkles
} from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Services", href: "#services", icon: Stethoscope },
    { name: "Hospitals", href: "#facilities", icon: Building2 },
    { name: "Schedules", href: "#facilities", icon: Calendar },
    { name: "How It Works", href: "#how-it-works", icon: Activity },
    { name: "FAQ", href: "#faq", icon: HelpCircle },
    { name: "Contact", href: "#contact", icon: PhoneCall },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B1730]/92 backdrop-blur-xl border-b border-slate-700/60 shadow-xl shadow-slate-950/20 py-2.5"
          : "bg-transparent border-b border-slate-800/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo with subtle hover glow */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-blue-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <Logo variant="light" size="md" className="relative z-10" />
          </div>

          {/* Desktop Navigation Links with animated indicator */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  <Icon className="w-4 h-4 text-teal-400/80 group-hover:text-teal-300 transition-colors" />
                  <span>{item.name}</span>
                  {/* Subtle animated bottom highlight bar */}
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-teal-400 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Sign In Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 border ${
                  loginDropdownOpen
                    ? "bg-slate-800 text-white border-teal-500/50 shadow-md ring-1 ring-teal-500/30"
                    : "text-slate-200 bg-slate-900/80 hover:bg-slate-800 hover:text-white border-slate-700/80 backdrop-blur-md"
                }`}
                aria-expanded={loginDropdownOpen}
              >
                <User className="w-4 h-4 text-teal-400" />
                Sign In
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${loginDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {loginDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2.5 w-60 bg-[#0F1E36]/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150"
                  onMouseLeave={() => setLoginDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/60 mb-1">
                    Select Your Workspace
                  </div>

                  <Link
                    href="/auth/patient-login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-teal-500/10 hover:text-teal-300 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white leading-snug">Patient Portal</div>
                      <div className="text-[11px] text-slate-400">Book visits & live queue ticket</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-800/80 my-1" />

                  <Link
                    href="/auth/staff-login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-blue-500/10 hover:text-blue-300 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white leading-snug">Healthcare Staff</div>
                      <div className="text-[11px] text-slate-400">Clinicians, nurses, officers</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Patient Register CTA */}
            <Link
              href="/auth/patient-register"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md shadow-teal-950/30 hover:shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Patient Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1730]/98 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <Icon className="w-5 h-5 text-teal-400" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
            <Link
              href="/auth/patient-login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-colors"
            >
              <User className="w-4 h-4 text-teal-400" />
              Patient Login
            </Link>
            <Link
              href="/auth/staff-login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-200 bg-slate-900/60 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              Staff Portal Login
            </Link>
            <Link
              href="/auth/patient-register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md transition-colors"
            >
              <span>Patient Registration</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
