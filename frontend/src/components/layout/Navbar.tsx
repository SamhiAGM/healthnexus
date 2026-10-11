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
  Activity
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Services", href: "#services", icon: Stethoscope },
    { name: "Hospitals", href: "#facilities", icon: Building2 },
    { name: "Schedules", href: "#schedules", icon: Calendar },
    { name: "How It Works", href: "#how-it-works", icon: Activity },
    { name: "FAQ", href: "#faq", icon: HelpCircle },
    { name: "Contact", href: "#contact", icon: PhoneCall },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B1730]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-3"
          : "bg-[#0B1730] border-b border-slate-800/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Logo variant="light" size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Icon className="w-4 h-4 text-teal-400" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Login Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
                aria-expanded={loginDropdownOpen}
              >
                <User className="w-4 h-4 text-teal-400" />
                Sign In
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {loginDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-[#0F1E36] border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50"
                  onMouseLeave={() => setLoginDropdownOpen(false)}
                >
                  <Link
                    href="/auth/patient-login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-teal-600/10 hover:text-teal-400 transition-colors"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="font-semibold">Patient Portal</div>
                      <div className="text-xs text-slate-400">Book visits & track queues</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-700/60 my-1" />

                  <Link
                    href="/auth/staff-login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-600/10 hover:text-blue-400 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-semibold">Healthcare Staff</div>
                      <div className="text-xs text-slate-400">Clinicians, nurses & officers</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Register Patient CTA */}
            <Link
              href="/auth/patient-register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm hover:shadow-teal-500/20 transition-all"
            >
              Patient Register
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1730] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Icon className="w-5 h-5 text-teal-400" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <Link
              href="/auth/patient-login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <User className="w-4 h-4 text-teal-400" />
              Patient Login
            </Link>
            <Link
              href="/auth/staff-login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-200 bg-slate-800/60 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              Staff Portal Login
            </Link>
            <Link
              href="/auth/patient-register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors"
            >
              Patient Registration
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
