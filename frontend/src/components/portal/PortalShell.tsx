"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  LucideIcon,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Activity,
  Calendar,
  Ticket,
  FileText,
  Pill,
  User,
  Settings
} from "lucide-react";

export interface NavItem {
  id?: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
}

interface PortalShellProps {
  role: string;
  roleTitle?: string;
  pageTitle?: string;
  department?: string;
  facility?: string;
  userName?: string;
  userEmail?: string;
  breadcrumbs?: { label: string; href?: string }[];
  navItems?: NavItem[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function PortalShell({
  role,
  roleTitle,
  pageTitle,
  department,
  facility = "National Hospital of Sri Lanka (NHSL)",
  userName,
  userEmail,
  breadcrumbs,
  navItems = [],
  activeTabId,
  onTabChange,
  children,
  headerActions
}: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayRoleTitle = roleTitle || role.replace(/_/g, " ");
  const displayName = userName || "Authorized Personnel";

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import("@/lib/api");
      await logoutUser();
    } catch (e) {}

    if (role === "PATIENT") {
      router.push("/auth/patient-login");
    } else {
      router.push("/auth/staff-login");
    }
  };

  const getRoleBadgeStyle = () => {
    switch (role.toUpperCase()) {
      case "DOCTOR":
      case "CLINIC_COORDINATOR":
      case "RECEPTIONIST":
      case "LAB_TECHNICIAN":
      case "LAB_STAFF":
        return "bg-[#DFEAF0] text-[#3A84A8] border-[#3A84A8]/30";
      case "NURSE":
        return "bg-rose-50 text-[#E26D5C] border-[#E26D5C]/30";
      case "PHARMACIST":
      case "PATIENT":
      case "PUBLIC_HEALTH_OFFICER":
        return "bg-[#E1F1EC] text-[#0F8B80] border-[#0F8B80]/30";
      case "FIELD_SUPERVISOR":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "HOSPITAL_ADMIN":
        return "bg-[#233B48] text-[#E1F1EC] border-[#0F8B80]/40";
      case "SYSTEM_ADMIN":
        return "bg-[#233B48] text-[#63E2D8] border-[#63E2D8]/40";
      default:
        return "bg-[#E1F1EC] text-[#0F8B80] border-[#0F8B80]/30";
    }
  };

  const effectiveNavItems: NavItem[] = navItems.length > 0 ? navItems : [
    { id: "overview", label: "Overview & Worklist", href: pathname, icon: ShieldCheck, active: true },
    { id: "hospitals", label: "Public Hospitals", href: "/hospitals", icon: Building2 }
  ];

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#EDF3F5] text-[#3F5362] flex flex-col selection:bg-[#0F8B80] selection:text-white relative">
      
      {/* Soft Ambient Healthcare Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-[#0F8B80]/4 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-[#3A84A8]/4 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-[#0F8B80]/3 rounded-full blur-[160px] pointer-events-none" />
      </div>

      {/* Top Universal Navbar (Uncluttered - No Hospital Directory Search) */}
      <header className="bg-[#F8FAF9]/95 border-b border-[#D6E3E7] sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle + Logo + Role/Facility Badge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#EDF3F5] border border-[#D6E3E7] text-[#3F5362] hover:text-[#233B48] transition"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Logo variant="dark" size="sm" />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#D6E3E7]">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${getRoleBadgeStyle()}`}>
                {displayRoleTitle}
              </span>
              <span className="hidden md:inline-block text-xs text-[#617583] truncate max-w-xs">
                &bull; {facility}
              </span>
            </div>
          </div>

          {/* Right: Operational Status + Actions + Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Operational Perimeter Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E1F1EC] border border-[#0F8B80]/20 text-xs font-semibold text-[#0F8B80]">
              <span className="w-2 h-2 rounded-full bg-[#0F8B80] animate-pulse" />
              <span>MoH Live Node</span>
            </div>

            {headerActions}

            {/* Notification Bell with Functional Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#617583] hover:text-[#233B48] hover:bg-[#EDF3F5] rounded-xl transition-colors relative"
                title="System Notifications"
                aria-label="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0F8B80] ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#F8FAF9] border border-[#D6E3E7] shadow-xl p-4 z-50 text-xs space-y-2 text-[#3F5362] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between font-bold text-[#233B48] border-b border-[#D6E3E7] pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0F8B80]" />
                      Clinical &amp; System Alerts
                    </span>
                    <span className="text-[10px] text-[#08786F] bg-[#E1F1EC] px-2 py-0.5 rounded-full font-bold">Live</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#EDF3F5] border border-[#D6E3E7] space-y-1">
                    <p className="font-bold text-[#233B48] flex items-center justify-between">
                      <span>Healthcare Mesh Active</span>
                      <span className="text-[10px] text-[#617583]">Synchronized</span>
                    </p>
                    <p className="text-[11px] text-[#617583]">Bidirectional tele-health connectivity active across regional MoH directorates.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#EDF3F5] border border-[#D6E3E7] space-y-1">
                    <p className="font-bold text-[#233B48] flex items-center justify-between">
                      <span>Cryptographic Session Guard</span>
                      <span className="text-[10px] text-[#0F8B80] font-bold">HttpOnly</span>
                    </p>
                    <p className="text-[11px] text-[#617583]">Zero credentials stored in localStorage. Session authorized server-side.</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#EDF3F5] hover:bg-[#E5EEF1] border border-[#D6E3E7] transition text-left"
                aria-label="User Profile Menu"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E1F1EC] border border-[#0F8B80]/30 text-[#0F8B80] font-bold text-xs flex items-center justify-center shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-[#233B48] truncate max-w-[130px] leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-[#0F8B80] font-semibold truncate max-w-[130px]">
                    {department || displayRoleTitle}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#617583]" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#F8FAF9] border border-[#D6E3E7] shadow-xl p-4 z-50 text-xs space-y-3 text-[#3F5362] animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-[#D6E3E7] pb-3">
                    <div className="font-bold text-[#233B48] text-sm">{displayName}</div>
                    <div className="text-[11px] text-[#617583] mt-0.5">{userEmail || `${role.toLowerCase()}@lankacare.me`}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#0F8B80]/30 bg-[#E1F1EC] text-[#0F8B80]">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{displayRoleTitle}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-[#617583]">
                    <div className="flex justify-between">
                      <span>Hospital Facility:</span>
                      <span className="font-semibold text-[#233B48] truncate max-w-[120px]">{facility}</span>
                    </div>
                    {department && (
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span className="font-semibold text-[#233B48]">{department}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Security Standard:</span>
                      <span className="font-semibold text-[#0F8B80]">SL-CERT Compliant</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D6E3E7] space-y-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Session</span>
                      </span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Two-Column Container (Desktop Left Sidebar ~256px + Main Content) */}
      <div className="flex min-w-0 flex-grow max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative z-10">
        
        {/* Desktop Sidebar (Width ~256px, Sticky Positioning, Section 8 Tokens) */}
        <aside className="hidden lg:flex flex-col w-[256px] shrink-0 rounded-3xl bg-[#F8FAF9] border border-[#D6E3E7] p-4 space-y-5 self-start sticky top-20 shadow-xs">
          
          {/* Facility Operational Base Box */}
          <div className="p-3.5 rounded-2xl bg-[#EDF3F5] border border-[#D6E3E7] space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#617583]">Facility Operational Base</span>
            <div className="text-xs font-bold text-[#233B48] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0F8B80] shrink-0" />
              <span className="truncate">{facility}</span>
            </div>
            {department && (
              <div className="text-[11px] text-[#617583] font-medium truncate">
                Unit: {department}
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 flex-grow">
            {effectiveNavItems.map((item, idx) => {
              const isItemActive = item.id && activeTabId 
                ? item.id === activeTabId 
                : item.active !== undefined 
                  ? item.active 
                  : item.href ? pathname === item.href : false;
              const Icon = item.icon;

              const content = (
                <div
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                    isItemActive
                      ? "bg-[#0F8B80] text-white font-bold shadow-xs shadow-[#0F8B80]/20"
                      : "text-[#617583] hover:bg-[#E5EEF1] hover:text-[#233B48]"
                  }`}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.id && onTabChange) {
                      onTabChange(item.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? "text-white" : "text-[#0F8B80]"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-1.5 ${
                      isItemActive ? "bg-white/20 text-white" : "bg-[#E1F1EC] text-[#0F8B80]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );

              if (item.href && (!onTabChange || !item.id)) {
                return (
                  <Link key={idx} href={item.href}>
                    {content}
                  </Link>
                );
              }

              return <div key={idx}>{content}</div>;
            })}
          </nav>

          {/* Sidebar Footer: RBAC Guard Notice & Directory Link */}
          <div className="pt-3 border-t border-[#D6E3E7] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#0F8B80] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#0F8B80] shrink-0" />
              <span>Role-Enforced RBAC</span>
            </div>
            <Link
              href="/hospitals"
              className="flex items-center justify-between text-[11px] text-[#617583] hover:text-[#0F8B80] pt-1 transition"
            >
              <span>Explore Public Hospitals</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 max-w-[80vw] bg-[#F8FAF9] border-r border-[#D6E3E7] p-5 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#D6E3E7] pb-3">
                  <Logo variant="dark" size="sm" />
                  <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-[#EDF3F5]">
                    <X className="w-5 h-5 text-[#617583]" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EDF3F5] border border-[#D6E3E7] space-y-1">
                  <div className="text-xs font-bold text-[#233B48]">{displayName}</div>
                  <div className="text-[11px] text-[#0F8B80] font-semibold">{displayRoleTitle}</div>
                  <div className="text-[10px] text-[#617583] truncate">{facility}</div>
                </div>

                <nav className="space-y-1.5">
                  {effectiveNavItems.map((item, idx) => {
                    const isItemActive = item.id && activeTabId ? item.id === activeTabId : item.active;
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer ${
                          isItemActive
                            ? "bg-[#0F8B80] text-white font-bold"
                            : "text-[#617583] hover:bg-[#E5EEF1] hover:text-[#233B48]"
                        }`}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          else if (item.id && onTabChange) onTabChange(item.id);
                          setMobileOpen(false);
                          if (item.href && (!onTabChange || !item.id)) router.push(item.href);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isItemActive ? "text-white" : "text-[#0F8B80]"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E1F1EC] text-[#0F8B80]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#D6E3E7]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Main Content Area: min-w-0 ensures no horizontal scroll */}
        <main className="min-w-0 flex-1 space-y-6 overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}
