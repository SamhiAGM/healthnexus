"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import {
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  Building2,
  Stethoscope,
  HelpCircle,
  PhoneCall,
  Activity,
  ArrowRight,
  Search,
  Sparkles,
  Info,
  UserPlus
} from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Activity },
    { name: "Hospitals", href: "/hospitals", icon: Building2, badge: "2026" },
    { name: "Services", href: "/#services", icon: Stethoscope },
    { name: "How It Works", href: "/#how-it-works", icon: Activity },
    { name: "About", href: "/#technology", icon: Info },
    { name: "Contact", href: "/#contact", icon: PhoneCall },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#F8FAFB]/95 backdrop-blur-xl border-b border-[#D9E3E9] shadow-xs py-2.5"
            : "bg-[#F0F4F7]/85 backdrop-blur-md border-b border-[#D9E3E9]/60 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <div className="relative group">
              <Logo variant="dark" size="md" className="relative z-10" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isCurrent = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
                      isCurrent
                        ? "text-[#087F79] bg-[#DFEFEC] shadow-2xs font-bold"
                        : "text-[#364A5D] hover:text-[#20364C] hover:bg-[#E8F0F4]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCurrent ? "text-[#087F79]" : "text-[#43566C]"}`} />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/20 ml-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions: Search + Auth Dropdowns */}
            <div className="hidden lg:flex items-center gap-2.5">
              
              {/* Global Search Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D9E3E9] text-xs font-medium text-[#43566C] hover:text-[#20364C] hover:border-[#159B94] hover:bg-[#F8FAFB] transition shadow-2xs group"
                aria-label="Open search dialog"
              >
                <Search className="w-3.5 h-3.5 text-[#087F79] group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline">Search hospitals, services...</span>
                <span className="xl:hidden">Search</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#E8F0F4] border border-[#D9E3E9] text-[10px] font-mono text-[#43566C]">
                  Ctrl K
                </kbd>
              </button>

              {/* Sign In Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLoginDropdownOpen(!loginDropdownOpen);
                    setRegisterDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition border ${
                    loginDropdownOpen
                      ? "bg-[#DFEFEC] text-[#087F79] border-[#159B94]"
                      : "bg-white text-[#20364C] hover:bg-[#E8F0F4] border-[#D9E3E9]"
                  }`}
                >
                  <User className="w-4 h-4 text-[#087F79]" />
                  <span>Sign In</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#43566C] transition-transform ${loginDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {loginDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white border border-[#D9E3E9] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setLoginDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#43566C]">
                      Select Access Level
                    </div>
                    <Link
                      href="/auth/patient-login"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#DFEFEC] transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#DFEFEC] text-[#087F79] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#20364C]">Citizen &amp; Patient Sign In</div>
                        <div className="text-[11px] text-[#43566C]">Queues, tokens &amp; lab records</div>
                      </div>
                    </Link>
                    <div className="my-1 border-t border-[#D9E3E9]" />
                    <Link
                      href="/auth/staff-login"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE8F5] transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#EBE8F5] text-[#426DA9] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#20364C]">Healthcare Professional</div>
                        <div className="text-[11px] text-[#43566C]">Doctors, Nurses, Pharmacy, Admin</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Register Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterDropdownOpen(!registerDropdownOpen);
                    setLoginDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-[#087F79] hover:bg-[#159B94] rounded-xl shadow-xs transition transform hover:-translate-y-0.2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform ${registerDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {registerDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white border border-[#D9E3E9] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setRegisterDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#43566C]">
                      Create Account
                    </div>
                    <Link
                      href="/auth/patient-register"
                      onClick={() => setRegisterDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#DFEFEC] transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#DFEFEC] text-[#087F79] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#20364C]">Patient Registration</div>
                        <div className="text-[11px] text-[#43566C]">Sri Lankan NIC / Passport</div>
                      </div>
                    </Link>
                    <div className="my-1 border-t border-[#D9E3E9]" />
                    <Link
                      href="/auth/staff-register"
                      onClick={() => setRegisterDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE8F5] transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#EBE8F5] text-[#426DA9] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#20364C]">Hospital Staff Application</div>
                        <div className="text-[11px] text-[#43566C]">Verified clinical credentialing</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* Mobile Action Controls */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2 rounded-xl bg-white border border-[#D9E3E9] text-[#087F79]"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white border border-[#D9E3E9] text-[#20364C] focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#F8FAFB] border-b border-[#D9E3E9] px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-4">
            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isCurrent = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isCurrent
                        ? "bg-[#DFEFEC] text-[#087F79]"
                        : "text-[#364A5D] hover:bg-[#E8F0F4] hover:text-[#20364C]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#087F79]" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/20">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#D9E3E9] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/patient-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-[#D9E3E9] text-[#20364C] text-xs font-bold text-center"
                >
                  <User className="w-3.5 h-3.5 text-[#087F79]" />
                  <span>Patient Login</span>
                </Link>
                <Link
                  href="/auth/staff-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#EBE8F5] border border-[#426DA9]/30 text-[#426DA9] text-xs font-bold text-center"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Staff Login</span>
                </Link>
              </div>

              <Link
                href="/auth/patient-register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#087F79] hover:bg-[#159B94] text-white font-bold text-sm shadow-xs transition"
              >
                <span>Register Patient Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
