"use client";

import React, { useState } from "react";
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
  ExternalLink
} from "lucide-react";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  active?: boolean;
}

interface PortalShellProps {
  role: string;
  roleTitle?: string;
  pageTitle?: string;
  department?: string;
  facility?: string;
  userName?: string;
  breadcrumbs?: { label: string; href?: string }[];
  navItems?: NavItem[];
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
  breadcrumbs,
  navItems = [],
  children,
  headerActions
}: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const displayRoleTitle = roleTitle || role.replace(/_/g, " ");
  const displayName = userName || "Authorized Personnel";

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

  const getRoleBadgeColor = () => {
    switch (role.toUpperCase()) {
      case "DOCTOR":
        return "bg-[#E8F0F4] text-[#426DA9] border-[#426DA9]/30";
      case "NURSE":
        return "bg-[#EBE8F5] text-[#43566C] border-[#D9E3E9]";
      case "PHARMACIST":
        return "bg-[#DFEFEC] text-[#159B94] border-[#159B94]/30";
      case "LAB_TECHNICIAN":
      case "LAB_STAFF":
        return "bg-[#E8F0F4] text-[#426DA9] border-[#426DA9]/30";
      case "PUBLIC_HEALTH_OFFICER":
      case "FIELD_SUPERVISOR":
        return "bg-[#DFEFEC] text-[#087F79] border-[#159B94]/30";
      case "HOSPITAL_ADMIN":
      case "SYSTEM_ADMIN":
        return "bg-[#20364C] text-[#DFEFEC] border-[#159B94]/30";
      case "CLINIC_COORDINATOR":
      case "RECEPTIONIST":
        return "bg-[#E8F0F4] text-[#426DA9] border-[#426DA9]/30";
      case "PATIENT":
        return "bg-[#DFEFEC] text-[#087F79] border-[#159B94]/30";
      default:
        return "bg-[#DFEFEC] text-[#087F79] border-[#159B94]/30";
    }
  };

  const effectiveNavItems: NavItem[] = navItems.length > 0 ? navItems : [
    { label: "Overview & Worklist", href: pathname, icon: ShieldCheck, active: true },
    { label: "Public Hospitals", href: "/hospitals", icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F7] text-[#364A5D] flex flex-col selection:bg-[#159B94] selection:text-white">
      
      {/* Top Universal Navbar */}
      <header className="bg-[#F8FAFB]/95 border-b border-[#D9E3E9] sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] text-[#43566C] hover:text-[#20364C]"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Logo variant="dark" size="sm" />

            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeColor()}`}>
                {displayRoleTitle}
              </span>
              <span className="hidden md:inline-block text-xs text-[#43566C]">
                &bull; {facility}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Shortcut */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F4F7] hover:bg-[#E8F0F4] border border-[#D9E3E9] text-xs text-[#43566C] transition"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#087F79]" />
              <span>Search Hospitals &amp; Records...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#D9E3E9] rounded text-[#43566C]">⌘K</kbd>
            </button>

            {headerActions}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#43566C] hover:text-[#20364C] hover:bg-[#F0F4F7] rounded-xl transition-colors relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#159B94] ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] shadow-xl p-4 z-50 text-xs space-y-2 text-[#364A5D]">
                  <div className="flex items-center justify-between font-bold text-[#20364C] border-b border-[#D9E3E9] pb-2">
                    <span>Clinical Notifications</span>
                    <span className="text-[10px] text-[#087F79] font-bold">Active</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] space-y-1">
                    <p className="font-bold text-[#20364C]">Healthcare Mesh Connected</p>
                    <p className="text-[11px] text-[#43566C]">Verified connection with Sri Lanka MoH 2026 data layer.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] space-y-1">
                    <p className="font-bold text-[#20364C]">Session Authenticated</p>
                    <p className="text-[11px] text-[#43566C]">Secure HttpOnly session with cryptographic role authorization.</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#20364C] flex items-center gap-1.5 justify-end">
                <span>{displayName}</span>
              </div>
              <div className="text-[10px] text-[#087F79] font-semibold">
                {department ? department : facility}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-[#43566C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        
        {/* Desktop Sidebar (Balanced Aesthetic) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] p-4 space-y-6 self-start sticky top-20 shadow-xs">
          
          <div className="p-3.5 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#43566C]">Active Facility</span>
            <div className="text-xs font-bold text-[#20364C] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#087F79] shrink-0" />
              <span className="truncate">{facility}</span>
            </div>
            {department && (
              <div className="text-[11px] text-[#43566C] font-medium">
                Dept: {department}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-grow">
            {effectiveNavItems.map((item, idx) => {
              const isActive = item.active !== undefined ? item.active : pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#087F79] text-white font-bold shadow-md shadow-[#087F79]/20"
                      : "text-[#43566C] hover:bg-[#F0F4F7] hover:text-[#20364C]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#087F79]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isActive ? "bg-white/20 text-white" : "bg-[#DFEFEC] text-[#087F79]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User ID & Session Guard Card */}
          <div className="pt-4 border-t border-[#D9E3E9] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#087F79] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#087F79] shrink-0" />
              <span>Role-Enforced Session</span>
            </div>
            <Link
              href="/hospitals"
              className="flex items-center justify-between text-[11px] text-[#43566C] hover:text-[#087F79] pt-1"
            >
              <span>Explore Hospital Network</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 max-w-[80vw] bg-[#F8FAFB] border-r border-[#D9E3E9] p-6 flex flex-col justify-between z-10 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#D9E3E9] pb-4">
                  <Logo variant="dark" size="sm" />
                  <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-[#F0F4F7]">
                    <X className="w-5 h-5 text-[#43566C]" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] text-xs">
                  <span className="text-[10px] font-bold uppercase text-[#43566C]">Active Role</span>
                  <div className="font-bold text-[#20364C] mt-0.5">{displayRoleTitle}</div>
                  <div className="text-[11px] text-[#087F79] mt-0.5">{facility}</div>
                </div>

                <nav className="space-y-1">
                  {effectiveNavItems.map((item, idx) => {
                    const isActive = item.active !== undefined ? item.active : pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-[#087F79] text-white"
                            : "text-[#43566C] hover:bg-[#F0F4F7]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">{item.badge}</span>}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of Workspace
              </button>
            </div>
          </div>
        )}

        {/* Content Pane */}
        <main className="flex-grow min-w-0 space-y-6">
          {pageTitle && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E3E9] pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#20364C] tracking-tight">{pageTitle}</h1>
                {breadcrumbs && (
                  <div className="flex items-center gap-1.5 text-xs text-[#43566C] mt-1">
                    {breadcrumbs.map((b, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <ChevronRight className="w-3 h-3 text-[#D9E3E9]" />}
                        {b.href ? (
                          <Link href={b.href} className="hover:text-[#087F79]">{b.label}</Link>
                        ) : (
                          <span className="text-[#20364C] font-semibold">{b.label}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {children}
        </main>

      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

    </div>
  );
}
