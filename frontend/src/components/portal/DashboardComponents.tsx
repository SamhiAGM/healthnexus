"use client";

import React, { useState } from "react";
import { 
  LucideIcon, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  X, 
  Info,
  Calendar,
  Sparkles,
  User,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* 1. PREMIUM STAT CARD                                                        */
/* -------------------------------------------------------------------------- */
export interface PremiumStatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: string; positive: boolean };
  icon: LucideIcon;
  badge?: string;
  colorScheme?: "teal" | "blue" | "purple" | "coral" | "slate";
}

export function PremiumStatCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  badge,
  colorScheme = "teal"
}: PremiumStatCardProps) {
  const schemeStyles = {
    teal: {
      bg: "bg-[#F8FAFB]",
      border: "border-[#D9E3E9] hover:border-[#159B94]",
      iconBg: "bg-[#DFEFEC] text-[#087F79] border-[#159B94]/30",
      accent: "text-[#087F79]"
    },
    blue: {
      bg: "bg-[#F8FAFB]",
      border: "border-[#D9E3E9] hover:border-[#426DA9]",
      iconBg: "bg-[#E8F0F4] text-[#426DA9] border-[#426DA9]/30",
      accent: "text-[#426DA9]"
    },
    purple: {
      bg: "bg-[#F8FAFB]",
      border: "border-[#D9E3E9] hover:border-[#9381FF]",
      iconBg: "bg-[#EBE8F5] text-[#43566C] border-[#D9E3E9]",
      accent: "text-[#43566C]"
    },
    coral: {
      bg: "bg-[#F8FAFB]",
      border: "border-[#D9E3E9] hover:border-rose-400",
      iconBg: "bg-rose-50 text-rose-700 border-rose-200",
      accent: "text-rose-700"
    },
    slate: {
      bg: "bg-[#F8FAFB]",
      border: "border-[#D9E3E9] hover:border-[#43566C]",
      iconBg: "bg-[#F0F4F7] text-[#43566C] border-[#D9E3E9]",
      accent: "text-[#43566C]"
    }
  }[colorScheme];

  return (
    <div className={`p-5 sm:p-6 rounded-2xl ${schemeStyles.bg} border ${schemeStyles.border} shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-[#43566C] uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${schemeStyles.iconBg} border flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#20364C] tracking-tight">{value}</div>
        {subValue && (
          <div className="text-xs text-[#43566C] mt-1 font-medium">{subValue}</div>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-4 pt-3 border-t border-[#D9E3E9] flex items-center justify-between text-xs">
          {trend ? (
            <span className={`flex items-center gap-1 font-semibold ${trend.positive ? "text-[#087F79]" : "text-rose-600"}`}>
              {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
            </span>
          ) : <span />}
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${schemeStyles.iconBg} border`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. CHART CARD CONTAINER                                                     */
/* -------------------------------------------------------------------------- */
export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ChartCard({ title, subtitle, badge, children, actions }: ChartCardProps) {
  return (
    <div className="rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E3E9] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-[#20364C]">{title}</h3>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F79] bg-[#DFEFEC] border border-[#159B94]/30 px-2 py-0.5 rounded">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#43566C]">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. ACTIVITY TIMELINE                                                        */
/* -------------------------------------------------------------------------- */
export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon?: LucideIcon;
  status?: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL";
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (!items || items.length === 0) {
    return <EmptyState title="No recent activity" message="No event history recorded in this period." />;
  }

  return (
    <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9E3E9]">
      {items.map((item) => {
        const Icon = item.icon || Clock;
        const statusColors = {
          SUCCESS: "text-[#087F79] bg-[#DFEFEC] border-[#159B94]/30",
          INFO: "text-[#426DA9] bg-[#E8F0F4] border-[#426DA9]/30",
          WARNING: "text-amber-700 bg-amber-50 border-amber-200",
          CRITICAL: "text-rose-700 bg-rose-50 border-rose-200"
        }[item.status || "INFO"];

        return (
          <div key={item.id} className="relative flex items-start gap-3 pl-8">
            <div className={`absolute left-1.5 top-0.5 w-5 h-5 rounded-full border ${statusColors} flex items-center justify-center shrink-0`}>
              <Icon className="w-3 h-3" />
            </div>
            <div className="flex-grow space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#20364C]">{item.title}</span>
                <span className="text-[11px] text-[#43566C]">{item.time}</span>
              </div>
              <p className="text-xs text-[#364A5D] leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. STATUS INDICATOR BADGE                                                   */
/* -------------------------------------------------------------------------- */
export function StatusIndicator({ status }: { status: string }) {
  const s = status.toUpperCase();
  const config = (() => {
    switch (s) {
      case "COMPLETED":
      case "APPROVED":
      case "VERIFIED":
      case "VERIFIED_CLOSED":
      case "CONFIRMED":
        return { label: status, bg: "bg-[#DFEFEC]", text: "text-[#087F79]", border: "border-[#159B94]/30", dot: "bg-[#087F79]" };
      case "IN_PROGRESS":
      case "IN_CONSULTATION":
      case "PROCESSING":
      case "OPEN":
      case "WAITING":
        return { label: status, bg: "bg-[#E8F0F4]", text: "text-[#426DA9]", border: "border-[#426DA9]/30", dot: "bg-[#426DA9] animate-pulse" };
      case "PENDING":
      case "PENDING_APPROVAL":
      case "CALLED":
        return { label: status, bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500 animate-pulse" };
      case "CANCELLED":
      case "REJECTED":
      case "CRITICAL":
      case "FAILED":
        return { label: status, bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", dot: "bg-rose-500" };
      default:
        return { label: status, bg: "bg-[#F0F4F7]", text: "text-[#43566C]", border: "border-[#D9E3E9]", dot: "bg-[#43566C]" };
    }
  })();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label.replace(/_/g, " ")}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. EMPTY STATE COMPONENT                                                    */
/* -------------------------------------------------------------------------- */
export function EmptyState({ 
  title = "No data found", 
  message = "No records match the requested filter or query.", 
  action 
}: { 
  title?: string; 
  message?: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="py-12 px-4 rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-[#DFEFEC] border border-[#159B94]/30 mx-auto flex items-center justify-center text-[#087F79]">
        <Info className="w-6 h-6 text-[#087F79]" />
      </div>
      <h4 className="text-sm font-bold text-[#20364C]">{title}</h4>
      <p className="text-xs text-[#43566C] max-w-sm mx-auto">{message}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. LOADING SKELETON                                                         */
/* -------------------------------------------------------------------------- */
export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-[#E8F0F4] border border-[#D9E3E9]" />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. ROLE ILLUSTRATION AVATAR                                                 */
/* -------------------------------------------------------------------------- */
export function RoleIllustration({ role, size = "md" }: { role: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-lg"
  }[size];

  const roleConfigs: Record<string, { initials: string; bg: string; text: string; border: string }> = {
    PATIENT: { initials: "PT", bg: "bg-[#DFEFEC]", text: "text-[#087F79]", border: "border-[#159B94]/30" },
    DOCTOR: { initials: "DR", bg: "bg-[#E8F0F4]", text: "text-[#426DA9]", border: "border-[#426DA9]/30" },
    NURSE: { initials: "NS", bg: "bg-[#EBE8F5]", text: "text-[#43566C]", border: "border-[#D9E3E9]" },
    RECEPTIONIST: { initials: "RC", bg: "bg-[#DFEFEC]", text: "text-[#087F79]", border: "border-[#159B94]/30" },
    PHARMACIST: { initials: "PH", bg: "bg-[#DFEFEC]", text: "text-[#159B94]", border: "border-[#159B94]/30" },
    LAB_TECHNICIAN: { initials: "LB", bg: "bg-[#E8F0F4]", text: "text-[#426DA9]", border: "border-[#426DA9]/30" },
    LAB_STAFF: { initials: "LB", bg: "bg-[#E8F0F4]", text: "text-[#426DA9]", border: "border-[#426DA9]/30" },
    PUBLIC_HEALTH_OFFICER: { initials: "PH", bg: "bg-[#E8F0F4]", text: "text-[#087F79]", border: "border-[#159B94]/30" },
    FIELD_SUPERVISOR: { initials: "FS", bg: "bg-[#E8F0F4]", text: "text-[#43566C]", border: "border-[#D9E3E9]" },
    HOSPITAL_ADMIN: { initials: "HA", bg: "bg-[#DFEFEC]", text: "text-[#087F79]", border: "border-[#159B94]/30" },
    SYSTEM_ADMIN: { initials: "SA", bg: "bg-[#20364C]", text: "text-[#DFEFEC]", border: "border-[#159B94]/40" },
    CLINIC_COORDINATOR: { initials: "CC", bg: "bg-[#E8F0F4]", text: "text-[#426DA9]", border: "border-[#426DA9]/30" },
  };

  const cfg = roleConfigs[role.toUpperCase()] || { initials: "HN", bg: "bg-[#DFEFEC]", text: "text-[#087F79]", border: "border-[#159B94]/30" };

  return (
    <div className={`${sizeMap} rounded-2xl ${cfg.bg} ${cfg.text} border ${cfg.border} font-bold flex items-center justify-center shrink-0 shadow-xs select-none`}>
      {cfg.initials}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 8. CONFIRMATION DIALOG                                                      */
/* -------------------------------------------------------------------------- */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#20364C]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#43566C] leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D9E3E9]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#43566C] hover:text-[#20364C] transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition ${
              isDestructive ? "bg-rose-600 hover:bg-rose-700" : "bg-[#087F79] hover:bg-[#159B94]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
