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
  LucideIcon
} from "lucide-react";

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
    switch (role) {
      case "DOCTOR":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "NURSE":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "PHARMACIST":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LAB_TECHNICIAN":
      case "LAB_STAFF":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "PUBLIC_HEALTH_OFFICER":
      case "FIELD_SUPERVISOR":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "HOSPITAL_ADMIN":
      case "SYSTEM_ADMIN":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "CLINIC_COORDINATOR":
      case "RECEPTIONIST":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-teal-50 text-teal-700 border-teal-200";
    }
  };

  const effectiveNavItems: NavItem[] = navItems.length > 0 ? navItems : [
    { label: "Overview & Worklist", href: pathname, icon: ShieldCheck, active: true },
    { label: "Institutional Mesh", href: pathname, icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="bg-white/95 border-b border-[#E2E8F0] sticky top-0 z-40 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Logo variant="dark" size="sm" />

            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor()}`}>
                {displayRoleTitle}
              </span>
              <span className="hidden md:inline-block text-xs text-slate-500">
                • {facility}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {headerActions}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 text-xs space-y-2 text-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-2">
                    <span>Clinical Notifications</span>
                    <span className="text-[10px] text-teal-600 font-semibold">Live</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="font-semibold text-slate-800">System Connected</p>
                    <p className="text-[11px] text-slate-500">Connected to HealthConnect LK regional healthcare mesh.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="font-semibold text-slate-800">Session Secure</p>
                    <p className="text-[11px] text-slate-500">HttpOnly session active with SL-CERT compliance.</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                <span>{displayName}</span>
              </div>
              <div className="text-[10px] text-teal-600 font-medium">
                {department ? department : facility}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-2xl bg-white border border-[#E2E8F0] p-4 space-y-6 self-start sticky top-20 shadow-sm">
          
          <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Active Workspace</span>
            <div className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{facility}</span>
            </div>
            {department && (
              <div className="text-[11px] text-slate-600 font-medium">
                Dept: {department}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 flex-grow">
            {effectiveNavItems.map((item, idx) => {
              const isActive = item.active !== undefined ? item.active : pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-teal-600 text-white font-semibold shadow-md shadow-teal-700/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-teal-600"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User ID Card */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Session</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Terminate Session
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex">
            <div className="w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between h-full shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Logo variant="dark" size="sm" />
                  <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
                  <div className="text-xs font-bold text-slate-800">{displayName}</div>
                  <div className="text-[10px] text-teal-600 font-semibold">{displayRoleTitle}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{facility}</div>
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
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                          isActive
                            ? "bg-teal-600 text-white font-semibold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-teal-600" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
            <div className="flex-grow" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Dashboard Main Content */}
        <main className="flex-grow w-full space-y-6 overflow-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}
