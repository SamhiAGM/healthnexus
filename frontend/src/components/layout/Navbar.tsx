"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { getCurrentUser, logoutUser, UserProfile } from "@/lib/api";
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
  Info,
  UserPlus,
  LayoutDashboard,
  LogOut
} from "lucide-react";

export function getDashboardRouteForUser(user: { roles?: string[] } | null): string {
  if (!user || !user.roles || user.roles.length === 0) return "/portal/patient";
  const roles = user.roles;
  if (roles.includes("SYSTEM_ADMIN")) return "/portal/admin";
  if (roles.includes("HOSPITAL_ADMIN")) return "/portal/hospital-admin";
  if (roles.includes("DOCTOR")) return "/portal/doctor";
  if (roles.includes("NURSE")) return "/portal/nurse";
  if (roles.includes("RECEPTIONIST")) return "/portal/reception";
  if (roles.includes("PHARMACIST")) return "/portal/pharmacy";
  if (roles.includes("LAB_TECHNICIAN") || roles.includes("LAB_STAFF")) return "/portal/laboratory";
  if (roles.includes("PUBLIC_HEALTH_OFFICER")) return "/portal/public-health";
  if (roles.includes("FIELD_SUPERVISOR")) return "/portal/supervisor";
  if (roles.includes("CLINIC_COORDINATOR")) return "/portal/coordinator";
  return "/portal/patient";
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const signInRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((profile) => {
      if (isMounted) setUser(profile);
    });
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (signInRef.current && !signInRef.current.contains(e.target as Node)) {
        setSignInDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/");
  };

  type PublicNavLink = { name: string; href: string; icon: typeof Activity; badge?: string };
  const primaryNavLinks: PublicNavLink[] = [
    { name: "Home", href: "/", icon: Activity },
    { name: "Hospitals", href: "/hospitals", icon: Building2, badge: "40+" },
    { name: "Services", href: "/#services", icon: Stethoscope },
    { name: "How It Works", href: "/#how-it-works", icon: Activity },
  ];

  const secondaryNavLinks: PublicNavLink[] = [
    { name: "About", href: "/#technology", icon: Info },
    { name: "FAQ", href: "/#faq", icon: HelpCircle },
    { name: "Contact", href: "/#contact", icon: PhoneCall },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];

  const dashboardRoute = getDashboardRouteForUser(user);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F8FAF9]/95 backdrop-blur-xl border-b border-[#D6E3E7] shadow-xs py-2.5"
          : "bg-[#EDF3F5]/90 backdrop-blur-md border-b border-[#D6E3E7]/80 py-3"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] min-w-0 items-center justify-between gap-4">
          
          {/* LEFT: HealthNexus Brand Logo */}
          <div className="shrink-0 flex items-center">
            <Logo variant="dark" size="sm" />
          </div>

          {/* CENTER: Desktop Navigation Links (Fully Visible on xl+, Smart Collapsed on lg) */}
          <nav className="hidden xl:flex items-center justify-center gap-1 2xl:gap-1.5 flex-1 min-w-0">
            {/* Primary Navigation Items */}
            {primaryNavLinks.map((item) => {
              const Icon = item.icon;
              const isCurrent = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                    isCurrent
                      ? "text-[#0F8B80] bg-[#E1F1EC] font-bold shadow-2xs"
                      : "text-[#3F5362] hover:text-[#233B48] hover:bg-[#E5EEF1]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-[#0F8B80]" : "text-[#617583]"}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#DFEAF0] text-[#3A84A8] border border-[#3A84A8]/20 ml-0.5">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Secondary Navigation Items: Visible directly on xl+ (1280px+) */}
            <div className="flex items-center gap-1 2xl:gap-1.5">
              {secondaryNavLinks.map((item) => {
                const Icon = item.icon;
                const isCurrent = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                      isCurrent
                        ? "text-[#0F8B80] bg-[#E1F1EC] font-bold shadow-2xs"
                        : "text-[#3F5362] hover:text-[#233B48] hover:bg-[#E5EEF1]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-[#0F8B80]" : "text-[#617583]"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Smart 'More' Dropdown on lg (1024px - 1279px) to prevent crowded overflow */}
            <div className="hidden relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  moreDropdownOpen ? "text-[#0F8B80] bg-[#E1F1EC]" : "text-[#3F5362] hover:bg-[#E5EEF1]"
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-2xl bg-[#F8FAF9] border border-[#D6E3E7] shadow-lg p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {secondaryNavLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#3F5362] hover:text-[#233B48] hover:bg-[#E5EEF1] font-semibold transition"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#0F8B80]" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* RIGHT: Authenticated Dashboard Action OR Sign In + Register Buttons */}
          <div className="hidden xl:flex items-center gap-2.5 shrink-0">
            {user ? (
              /* Authenticated User: Direct Dashboard Navigation */
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardRoute}
                  className="flex items-center gap-2 px-4 py-2 text-xs xl:text-sm font-bold text-white bg-[#0F8B80] hover:bg-[#08786F] rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-[#617583] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Unauthenticated Visitors: Clean Sign In Dropdown + Register Patient Button */
              <>
                {/* Sign In Dropdown */}
                <div className="relative" ref={signInRef}>
                  <button
                    type="button"
                    onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs xl:text-sm font-bold rounded-xl text-[#233B48] hover:text-[#0F8B80] hover:bg-[#E5EEF1] border border-[#D6E3E7] bg-[#F8FAF9] transition whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5 text-[#0F8B80]" />
                    <span>Sign In</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${signInDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {signInDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#F8FAF9] border border-[#D6E3E7] shadow-xl p-2.5 z-50 text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#617583] tracking-wider border-b border-[#D6E3E7]">
                        Select Portal
                      </div>

                      <Link
                        href="/auth/patient-login"
                        onClick={() => setSignInDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#E1F1EC] text-[#233B48] hover:text-[#0F8B80] transition group font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#0F8B80]" />
                          <div>
                            <div className="font-bold text-xs">Citizen Patient</div>
                            <div className="text-[10px] text-[#617583]">Queues &amp; Appointments</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#0F8B80] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>

                      <Link
                        href="/auth/staff-login"
                        onClick={() => setSignInDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#DFEAF0] text-[#233B48] hover:text-[#3A84A8] transition group font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#3A84A8]" />
                          <div>
                            <div className="font-bold text-xs">Healthcare Staff</div>
                            <div className="text-[10px] text-[#617583]">Clinicians &amp; Officers</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#3A84A8] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Register Patient Button */}
                <Link
                  href="/auth/patient-register"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs xl:text-sm font-bold text-white bg-[#0F8B80] hover:bg-[#08786F] rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Patient</span>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE TOGGLE BUTTON (Visible below lg / 1024px) */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#D6E3E7] text-[#233B48] hover:text-[#0F8B80] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER / MENU (< 1024px) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#F8FAF9] border-b border-[#D6E3E7] px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-3">
          <div className="space-y-1">
            {allNavLinks.map((item) => {
              const Icon = item.icon;
              const isCurrent = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-[#E1F1EC] text-[#0F8B80] font-bold"
                      : "text-[#3F5362] hover:bg-[#E5EEF1] hover:text-[#233B48]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#0F8B80]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#DFEAF0] text-[#3A84A8] border border-[#3A84A8]/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#D6E3E7] space-y-2">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={dashboardRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0F8B80] text-white font-bold text-sm shadow-xs transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/patient-login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-[#D6E3E7] text-[#233B48] text-xs font-bold text-center hover:bg-[#E1F1EC]"
                  >
                    <User className="w-3.5 h-3.5 text-[#0F8B80]" />
                    <span>Patient Login</span>
                  </Link>
                  <Link
                    href="/auth/staff-login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#DFEAF0] border border-[#3A84A8]/30 text-[#3A84A8] text-xs font-bold text-center hover:bg-[#DFEAF0]/80"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Staff Login</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/patient-register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0F8B80] text-white text-xs font-bold text-center shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Patient Registration</span>
                  </Link>
                  <Link
                    href="/auth/staff-register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-[#D6E3E7] text-[#233B48] text-xs font-bold text-center hover:bg-[#E5EEF1]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3A84A8]" />
                    <span>Staff Registration</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
