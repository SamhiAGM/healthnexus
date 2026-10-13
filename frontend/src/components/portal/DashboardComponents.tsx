"use client";

import React from "react";
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
  colorScheme?: "teal" | "blue" | "coral" | "amber" | "slate" | "purple";
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
      bg: "bg-[#F8FAF9]",
      border: "border-[#D6E3E7] hover:border-[#0F8B80]",
      iconBg: "bg-[#E1F1EC] text-[#0F8B80] border-[#0F8B80]/30",
      accent: "text-[#0F8B80]"
    },
    blue: {
      bg: "bg-[#F8FAF9]",
      border: "border-[#D6E3E7] hover:border-[#3A84A8]",
      iconBg: "bg-[#DFEAF0] text-[#3A84A8] border-[#3A84A8]/30",
      accent: "text-[#3A84A8]"
    },
    coral: {
      bg: "bg-[#F8FAF9]",
      border: "border-[#D6E3E7] hover:border-rose-400",
      iconBg: "bg-rose-50 text-rose-700 border-rose-200",
      accent: "text-rose-700"
    },
    amber: {
      bg: "bg-[#F8FAF9]",
      border: "border-[#D6E3E7] hover:border-amber-400",
      iconBg: "bg-amber-50 text-amber-800 border-amber-200",
      accent: "text-amber-800"
    },
    purple: {
      bg: "bg-[#F8FAF9]",
      border: "border-[#D6E3E7] hover:border-purple-400",
      iconBg: "bg-purple-50 text-purple-700 border-purple-200",
      accent: "text-purple-700"
    },
    slate: {
      bg: "bg-[#F8FAF9]",
      border: "border-[#D6E3E7] hover:border-[#617583]",
      iconBg: "bg-[#EDF3F5] text-[#3F5362] border-[#D6E3E7]",
      accent: "text-[#3F5362]"
    }
  }[colorScheme];

  return (
    <div className={`p-5 sm:p-6 rounded-3xl ${schemeStyles.bg} border ${schemeStyles.border} shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-[#617583] uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-2xl ${schemeStyles.iconBg} border flex items-center justify-center shrink-0 shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#233B48] tracking-tight">{value}</div>
        {subValue && (
          <div className="text-xs text-[#617583] mt-1 font-medium">{subValue}</div>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-4 pt-3 border-t border-[#D6E3E7] flex items-center justify-between text-xs">
          {trend ? (
            <span className={`flex items-center gap-1 font-bold ${trend.positive ? "text-[#0F8B80]" : "text-rose-600"}`}>
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
    <div className="rounded-3xl bg-[#F8FAF9] border border-[#D6E3E7] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6E3E7] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-[#233B48]">{title}</h3>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F8B80] bg-[#E1F1EC] border border-[#0F8B80]/30 px-2.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#617583]">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. ACTIVITY TIMELINE ITEM                                                   */
/* -------------------------------------------------------------------------- */
export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status?: "SUCCESS" | "WARNING" | "INFO" | "ALERT";
  icon?: LucideIcon;
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-[#0F8B80] bg-[#E1F1EC] border-[#0F8B80]/30";
      case "WARNING":
        return "text-amber-800 bg-amber-50 border-amber-300";
      case "ALERT":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-[#3A84A8] bg-[#DFEAF0] border-[#3A84A8]/30";
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const Icon = item.icon || Clock;
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="relative flex items-start gap-4">
            {!isLast && (
              <span className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-[#D6E3E7]" aria-hidden="true" />
            )}

            <div className={`relative flex h-8 w-8 items-center justify-center rounded-2xl border ${getStatusColor(item.status)} shadow-xs shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-bold text-[#233B48] truncate">{item.title}</p>
                <span className="text-[10px] text-[#617583] whitespace-nowrap">{item.time}</span>
              </div>
              <p className="text-xs text-[#617583] leading-relaxed">{item.description}</p>
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
      case "RESOLVED":
        return { label: status, bg: "bg-[#E1F1EC]", text: "text-[#0F8B80]", border: "border-[#0F8B80]/30", dot: "bg-[#0F8B80]" };
      case "IN_PROGRESS":
      case "IN_CONSULTATION":
      case "PROCESSING":
      case "OPEN":
      case "WAITING":
        return { label: status, bg: "bg-[#DFEAF0]", text: "text-[#3A84A8]", border: "border-[#3A84A8]/30", dot: "bg-[#3A84A8] animate-pulse" };
      case "PENDING":
      case "PENDING_APPROVAL":
      case "CALLED":
      case "PRIORITY":
        return { label: status, bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", dot: "bg-amber-500 animate-pulse" };
      case "CANCELLED":
      case "REJECTED":
      case "CRITICAL":
      case "FAILED":
      case "EXPIRED":
        return { label: status, bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300", dot: "bg-rose-500" };
      default:
        return { label: status, bg: "bg-[#EDF3F5]", text: "text-[#3F5362]", border: "border-[#D6E3E7]", dot: "bg-[#617583]" };
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
  title = "No records found", 
  message = "No data available matching current filters or selection.", 
  action,
  icon: CustomIcon
}: { 
  title?: string; 
  message?: string; 
  action?: React.ReactNode;
  icon?: LucideIcon;
}) {
  const Icon = CustomIcon || Info;
  return (
    <div className="py-12 px-6 rounded-3xl bg-[#F8FAF9] border border-[#D6E3E7] text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-[#E1F1EC] border border-[#0F8B80]/30 mx-auto flex items-center justify-center text-[#0F8B80]">
        <Icon className="w-6 h-6 text-[#0F8B80]" />
      </div>
      <h4 className="text-sm font-bold text-[#233B48]">{title}</h4>
      <p className="text-xs text-[#617583] max-w-sm mx-auto leading-relaxed">{message}</p>
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
        <div key={i} className="h-16 rounded-2xl bg-[#E5EEF1] border border-[#D6E3E7]" />
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
    PATIENT: { initials: "PT", bg: "bg-[#E1F1EC]", text: "text-[#0F8B80]", border: "border-[#0F8B80]/30" },
    DOCTOR: { initials: "DR", bg: "bg-[#DFEAF0]", text: "text-[#3A84A8]", border: "border-[#3A84A8]/30" },
    NURSE: { initials: "NS", bg: "bg-rose-50", text: "text-[#E26D5C]", border: "border-[#E26D5C]/30" },
    RECEPTIONIST: { initials: "RC", bg: "bg-[#DFEAF0]", text: "text-[#3A84A8]", border: "border-[#3A84A8]/30" },
    PHARMACIST: { initials: "PH", bg: "bg-[#E1F1EC]", text: "text-[#0F8B80]", border: "border-[#0F8B80]/30" },
    LAB_TECHNICIAN: { initials: "LB", bg: "bg-[#DFEAF0]", text: "text-[#3A84A8]", border: "border-[#3A84A8]/30" },
    LAB_STAFF: { initials: "LB", bg: "bg-[#DFEAF0]", text: "text-[#3A84A8]", border: "border-[#3A84A8]/30" },
    PUBLIC_HEALTH_OFFICER: { initials: "PH", bg: "bg-[#E1F1EC]", text: "text-[#0F8B80]", border: "border-[#0F8B80]/30" },
    FIELD_SUPERVISOR: { initials: "FS", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300" },
    HOSPITAL_ADMIN: { initials: "HA", bg: "bg-[#233B48]", text: "text-[#E1F1EC]", border: "border-[#0F8B80]/40" },
    SYSTEM_ADMIN: { initials: "SA", bg: "bg-[#233B48]", text: "text-[#63E2D8]", border: "border-[#63E2D8]/40" },
    CLINIC_COORDINATOR: { initials: "CC", bg: "bg-[#DFEAF0]", text: "text-[#3A84A8]", border: "border-[#3A84A8]/30" },
  };

  const cfg = roleConfigs[role.toUpperCase()] || { initials: "HN", bg: "bg-[#E1F1EC]", text: "text-[#0F8B80]", border: "border-[#0F8B80]/30" };

  return (
    <div className={`${sizeMap} rounded-2xl ${cfg.bg} ${cfg.text} border ${cfg.border} font-extrabold flex items-center justify-center shrink-0 shadow-xs select-none`}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8FAF9] border border-[#D6E3E7] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#233B48]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#3F5362] leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6E3E7]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#617583] hover:text-[#233B48] transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition ${
              isDestructive ? "bg-rose-600 hover:bg-rose-700" : "bg-[#0F8B80] hover:bg-[#08786F]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
