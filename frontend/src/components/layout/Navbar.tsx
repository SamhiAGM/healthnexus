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
  Compass
} from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isLightNav = pathname !== "/" || isScrolled;

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
    { name: "Services", href: "/#services", icon: Stethoscope },
    { name: "Hospital Directory", href: "/hospitals", icon: Building2 },
    { name: "How It Works", href: "/#how-it-works", icon: Activity },
    { name: "FAQ", href: "/#faq", icon: HelpCircle },
    { name: "Contact", href: "/#contact", icon: PhoneCall },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLightNav
          ? "bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm py-2.5"
          : "bg-transparent border-b border-white/10 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="relative group">
            <Logo variant={isLightNav ? "dark" : "light"} size="md" className="relative z-10" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isHospitals = item.href === "/hospitals";
              const isCurrent = pathname === "/hospitals" && isHospitals;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isCurrent
                      ? "text-[#0F766E] font-semibold bg-teal-50"
                      : isLightNav
                        ? "text-[#52657F] hover:text-[#172B4D] hover:bg-slate-100"
                        : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${
                    isCurrent ? "text-[#0F766E]" : isLightNav ? "text-slate-500 group-hover:text-[#0F766E]" : "text-teal-400 group-hover:text-teal-300"
                  }`} />
                  <span>{item.name}</span>
                  {isHospitals && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 ml-0.5">
                      2026
                    </span>
                  )}
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
                    ? "bg-slate-100 text-[#172B4D] border-teal-500 shadow-sm"
                    : isLightNav
                      ? "text-[#172B4D] bg-white hover:bg-slate-50 border-[#E2E8F0] shadow-sm"
                      : "text-white bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 backdrop-blur-md"
                }`}
                aria-expanded={loginDropdownOpen}
              >
                <User className="w-4 h-4 text-[#0F766E]" />
                <span>Sign In</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${loginDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {loginDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2.5 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150"
                  onMouseLeave={() => setLoginDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Select Your Portal
                  </div>

                  <Link
                    href="/auth/patient-login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#172B4D] hover:bg-teal-50 hover:text-[#0F766E] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E] shrink-0 group-hover:scale-105 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#172B4D] leading-snug">Patient Portal</div>
                      <div className="text-[11px] text-[#52657F]">Book clinic visits & queue tickets</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <Link
                    href="/auth/staff-login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#172B4D] hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#172B4D] leading-snug">Healthcare Staff</div>
                      <div className="text-[11px] text-[#52657F]">Clinicians, nurses, coordinators</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Patient Register CTA */}
            <Link
              href="/auth/patient-register"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#0d645e] rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Register Patient</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-colors ${
                isLightNav ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#172B4D] hover:bg-teal-50 hover:text-[#0F766E] transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#0F766E]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/auth/patient-login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172B4D] font-semibold text-sm transition-colors"
            >
              <User className="w-4 h-4 text-[#0F766E]" />
              <span>Patient Sign In</span>
            </Link>

            <Link
              href="/auth/staff-login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-colors border border-blue-200"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Healthcare Staff Sign In</span>
            </Link>

            <Link
              href="/auth/patient-register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0d645e] text-white font-semibold text-sm transition-all shadow-md"
            >
              <span>Register Patient Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
