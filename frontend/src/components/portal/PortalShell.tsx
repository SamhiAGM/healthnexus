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
  ChevronRight,
  ShieldCheck, 
  User,
  LucideIcon,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Lock,
  Layers,
  Sparkles
} from "lucide-react";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
        return "bg-[#DFEAF0] text-[#467DA3] border-[#467DA3]/30";
      case "NURSE":
        return "bg-rose-50 text-[#E26D5C] border-[#E26D5C]/30";
      case "PHARMACIST":
      case "PATIENT":
        return "bg-[#DDEFE9] text-[#08786F] border-[#108B83]/30";
      case "PUBLIC_HEALTH_OFFICER":
        return "bg-[#DDEFE9] text-[#08786F] border-[#108B83]/30";
      case "FIELD_SUPERVISOR":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "HOSPITAL_ADMIN":
        return "bg-[#243847] text-[#DDEFE9] border-[#108B83]/40";
      case "SYSTEM_ADMIN":
        return "bg-[#243847] text-[#63E2D8] border-[#63E2D8]/40";
      default:
        return "bg-[#DDEFE9] text-[#08786F] border-[#108B83]/30";
    }
  };

  const effectiveNavItems: NavItem[] = navItems.length > 0 ? navItems : [
    { id: "overview", label: "Overview & Worklist", href: pathname, icon: ShieldCheck, active: true },
    { id: "hospitals", label: "Public Hospitals", href: "/hospitals", icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-[#EDF2F4] text-[#3C5262] flex flex-col selection:bg-[#108B83] selection:text-white relative">
      
      {/* Soft Ambient Healthcare Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-[#108B83]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-[#467DA3]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-[#108B83]/4 rounded-full blur-[160px] pointer-events-none" />
      </div>

      {/* Top Universal Navbar */}
      <header className="bg-[#F6F9F8]/95 border-b border-[#D5E0E3] sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#EDF2F4] border border-[#D5E0E3] text-[#3C5262] hover:text-[#243847]"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Logo variant="dark" size="sm" />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#D5E0E3]">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeStyle()}`}>
                {displayRoleTitle}
              </span>
              <span className="hidden md:inline-block text-xs text-[#667986] truncate max-w-xs">
                &bull; {facility}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Shortcut */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#EDF2F4] hover:bg-[#E7EFF1] border border-[#D5E0E3] text-xs text-[#667986] transition"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#108B83]" />
              <span>Search Facility &amp; Records...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#D5E0E3] rounded text-[#667986]">⌘K</kbd>
            </button>

            {headerActions}

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#667986] hover:text-[#243847] hover:bg-[#EDF2F4] rounded-xl transition-colors relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#108B83] ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-xl p-4 z-50 text-xs space-y-2 text-[#3C5262] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between font-bold text-[#243847] border-b border-[#D5E0E3] pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
                      Clinical &amp; System Alerts
                    </span>
                    <span className="text-[10px] text-[#08786F] bg-[#DDEFE9] px-2 py-0.5 rounded-full font-bold">Active</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F6F9F8] border border-[#D5E0E3] space-y-1">
                    <p className="font-bold text-[#243847] flex items-center justify-between">
                      <span>Healthcare Mesh Synchronized</span>
                      <span className="text-[10px] text-[#667986]">Live</span>
                    </p>
                    <p className="text-[11px] text-[#667986]">Verified bidirectional connectivity with Sri Lanka MoH 2026 perimeter.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F6F9F8] border border-[#D5E0E3] space-y-1">
                    <p className="font-bold text-[#243847] flex items-center justify-between">
                      <span>Cryptographic Session Active</span>
                      <span className="text-[10px] text-[#108B83] font-bold">HttpOnly</span>
                    </p>
                    <p className="text-[11px] text-[#667986]">Zero credentials in browser storage. Token lifecycle server-enforced.</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#EDF2F4] hover:bg-[#E7EFF1] border border-[#D5E0E3] transition text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-[#DDEFE9] border border-[#108B83]/30 text-[#08786F] font-bold text-xs flex items-center justify-center shrink-0">
                  {displayName.charAt(0)}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-[#243847] truncate max-w-[120px] leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-[#108B83] font-semibold truncate max-w-[120px]">
                    {department || displayRoleTitle}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#667986]" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-xl p-4 z-50 text-xs space-y-3 text-[#3C5262] animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-[#D5E0E3] pb-3">
                    <div className="font-bold text-[#243847] text-sm">{displayName}</div>
                    <div className="text-[11px] text-[#667986] mt-0.5">{userEmail || `${role.toLowerCase()}@lankacare.me`}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#108B83]/30 bg-[#DDEFE9] text-[#08786F]">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{displayRoleTitle}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-[#667986]">
                    <div className="flex justify-between">
                      <span>Hospital:</span>
                      <span className="font-semibold text-[#243847] truncate max-w-[120px]">{facility}</span>
                    </div>
                    {department && (
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span className="font-semibold text-[#243847]">{department}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Perimeter:</span>
                      <span className="font-semibold text-[#08786F]">MoH End-to-End Encrypted</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D5E0E3]">
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

      {/* Main Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 relative z-10">
        
        {/* Desktop Sidebar (Balanced Middle-Tone Aesthetic) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-3xl bg-[#F6F9F8] border border-[#D5E0E3] p-4 space-y-6 self-start sticky top-20 shadow-xs">
          
          <div className="p-3.5 rounded-2xl bg-[#EDF2F4] border border-[#D5E0E3] space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#667986]">Facility Operational Base</span>
            <div className="text-xs font-bold text-[#243847] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#108B83] shrink-0" />
              <span className="truncate">{facility}</span>
            </div>
            {department && (
              <div className="text-[11px] text-[#667986] font-medium truncate">
                Ward / Unit: {department}
              </div>
            )}
          </div>

          {/* Navigation Links */}
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
                      ? "bg-[#108B83] text-white font-bold shadow-xs shadow-[#108B83]/20"
                      : "text-[#667986] hover:bg-[#EDF2F4] hover:text-[#243847]"
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
                    <Icon className={`w-4 h-4 ${isItemActive ? "text-white" : "text-[#108B83]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isItemActive ? "bg-white/20 text-white" : "bg-[#DDEFE9] text-[#08786F]"
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

          {/* Session Security Guard Card */}
          <div className="pt-4 border-t border-[#D5E0E3] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#08786F] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#108B83] shrink-0" />
              <span>Role-Enforced RBAC</span>
            </div>
            <Link
              href="/hospitals"
              className="flex items-center justify-between text-[11px] text-[#667986] hover:text-[#108B83] pt-1 transition"
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
            <div className="relative w-72 max-w-[80vw] bg-[#F6F9F8] border-r border-[#D5E0E3] p-6 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#D5E0E3] pb-4">
                  <Logo variant="dark" size="sm" />
                  <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-[#EDF2F4]">
                    <X className="w-5 h-5 text-[#667986]" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EDF2F4] border border-[#D5E0E3] space-y-1">
                  <div className="text-xs font-bold text-[#243847]">{displayName}</div>
                  <div className="text-[11px] text-[#08786F] font-semibold">{displayRoleTitle}</div>
                  <div className="text-[10px] text-[#667986] truncate">{facility}</div>
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
                            ? "bg-[#108B83] text-white font-bold"
                            : "text-[#667986] hover:bg-[#EDF2F4] hover:text-[#243847]"
                        }`}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          else if (item.id && onTabChange) onTabChange(item.id);
                          setMobileOpen(false);
                          if (item.href && (!onTabChange || !item.id)) router.push(item.href);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isItemActive ? "text-white" : "text-[#108B83]"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DDEFE9] text-[#08786F]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#D5E0E3]">
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

        {/* Primary Main Content Area */}
        <main className="flex-grow min-w-0 space-y-6">
          {children}
        </main>

      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
