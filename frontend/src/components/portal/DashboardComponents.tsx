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
      bg: "bg-[#FAFBFA]",
      border: "border-[#D5E0E3] hover:border-[#108B83]",
      iconBg: "bg-[#DDEFE9] text-[#08786F] border-[#108B83]/30",
      accent: "text-[#08786F]"
    },
    blue: {
      bg: "bg-[#FAFBFA]",
      border: "border-[#D5E0E3] hover:border-[#467DA3]",
      iconBg: "bg-[#DFEAF0] text-[#467DA3] border-[#467DA3]/30",
      accent: "text-[#467DA3]"
    },
    coral: {
      bg: "bg-[#FAFBFA]",
      border: "border-[#D5E0E3] hover:border-rose-400",
      iconBg: "bg-rose-50 text-rose-700 border-rose-200",
      accent: "text-rose-700"
    },
    amber: {
      bg: "bg-[#FAFBFA]",
      border: "border-[#D5E0E3] hover:border-amber-400",
      iconBg: "bg-amber-50 text-amber-800 border-amber-200",
      accent: "text-amber-800"
    },
    purple: {
      bg: "bg-[#FAFBFA]",
      border: "border-[#D5E0E3] hover:border-purple-400",
      iconBg: "bg-purple-50 text-purple-700 border-purple-200",
      accent: "text-purple-700"
    },
    slate: {
      bg: "bg-[#FAFBFA]",
      border: "border-[#D5E0E3] hover:border-[#667986]",
      iconBg: "bg-[#EDF2F4] text-[#3C5262] border-[#D5E0E3]",
      accent: "text-[#3C5262]"
    }
  }[colorScheme];

  return (
    <div className={`p-5 sm:p-6 rounded-3xl ${schemeStyles.bg} border ${schemeStyles.border} shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-[#667986] uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-2xl ${schemeStyles.iconBg} border flex items-center justify-center shrink-0 shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#243847] tracking-tight">{value}</div>
        {subValue && (
          <div className="text-xs text-[#667986] mt-1 font-medium">{subValue}</div>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-4 pt-3 border-t border-[#D5E0E3] flex items-center justify-between text-xs">
          {trend ? (
            <span className={`flex items-center gap-1 font-bold ${trend.positive ? "text-[#08786F]" : "text-rose-600"}`}>
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
    <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E0E3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-[#243847]">{title}</h3>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-2.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#667986]">{subtitle}</p>}
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
    return <EmptyState title="No recent activity" message="No operational events recorded in this timeframe." />;
  }

  return (
    <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5E0E3]">
      {items.map((item) => {
        const Icon = item.icon || Clock;
        const statusColors = {
          SUCCESS: "text-[#08786F] bg-[#DDEFE9] border-[#108B83]/30",
          INFO: "text-[#467DA3] bg-[#DFEAF0] border-[#467DA3]/30",
          WARNING: "text-amber-800 bg-amber-50 border-amber-300",
          CRITICAL: "text-rose-800 bg-rose-50 border-rose-300"
        }[item.status || "INFO"];

        return (
          <div key={item.id} className="relative flex items-start gap-3 pl-8">
            <div className={`absolute left-1.5 top-0.5 w-5 h-5 rounded-full border ${statusColors} flex items-center justify-center shrink-0`}>
              <Icon className="w-3 h-3" />
            </div>
            <div className="flex-grow space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#243847]">{item.title}</span>
                <span className="text-[11px] text-[#667986] font-mono">{item.time}</span>
              </div>
              <p className="text-xs text-[#3C5262] leading-relaxed">{item.description}</p>
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
        return { label: status, bg: "bg-[#DDEFE9]", text: "text-[#08786F]", border: "border-[#108B83]/30", dot: "bg-[#08786F]" };
      case "IN_PROGRESS":
      case "IN_CONSULTATION":
      case "PROCESSING":
      case "OPEN":
      case "WAITING":
        return { label: status, bg: "bg-[#DFEAF0]", text: "text-[#467DA3]", border: "border-[#467DA3]/30", dot: "bg-[#467DA3] animate-pulse" };
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
        return { label: status, bg: "bg-[#EDF2F4]", text: "text-[#3C5262]", border: "border-[#D5E0E3]", dot: "bg-[#667986]" };
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
    <div className="py-12 px-6 rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30 mx-auto flex items-center justify-center text-[#08786F]">
        <Icon className="w-6 h-6 text-[#08786F]" />
      </div>
      <h4 className="text-sm font-bold text-[#243847]">{title}</h4>
      <p className="text-xs text-[#667986] max-w-sm mx-auto leading-relaxed">{message}</p>
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
        <div key={i} className="h-16 rounded-2xl bg-[#E7EFF1] border border-[#D5E0E3]" />
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
    PATIENT: { initials: "PT", bg: "bg-[#DDEFE9]", text: "text-[#08786F]", border: "border-[#108B83]/30" },
    DOCTOR: { initials: "DR", bg: "bg-[#DFEAF0]", text: "text-[#467DA3]", border: "border-[#467DA3]/30" },
    NURSE: { initials: "NS", bg: "bg-rose-50", text: "text-[#E26D5C]", border: "border-[#E26D5C]/30" },
    RECEPTIONIST: { initials: "RC", bg: "bg-[#DFEAF0]", text: "text-[#467DA3]", border: "border-[#467DA3]/30" },
    PHARMACIST: { initials: "PH", bg: "bg-[#DDEFE9]", text: "text-[#108B83]", border: "border-[#108B83]/30" },
    LAB_TECHNICIAN: { initials: "LB", bg: "bg-[#DFEAF0]", text: "text-[#467DA3]", border: "border-[#467DA3]/30" },
    LAB_STAFF: { initials: "LB", bg: "bg-[#DFEAF0]", text: "text-[#467DA3]", border: "border-[#467DA3]/30" },
    PUBLIC_HEALTH_OFFICER: { initials: "PH", bg: "bg-[#DDEFE9]", text: "text-[#08786F]", border: "border-[#108B83]/30" },
    FIELD_SUPERVISOR: { initials: "FS", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300" },
    HOSPITAL_ADMIN: { initials: "HA", bg: "bg-[#243847]", text: "text-[#DDEFE9]", border: "border-[#108B83]/40" },
    SYSTEM_ADMIN: { initials: "SA", bg: "bg-[#243847]", text: "text-[#63E2D8]", border: "border-[#63E2D8]/40" },
    CLINIC_COORDINATOR: { initials: "CC", bg: "bg-[#DFEAF0]", text: "text-[#467DA3]", border: "border-[#467DA3]/30" },
  };

  const cfg = roleConfigs[role.toUpperCase()] || { initials: "HN", bg: "bg-[#DDEFE9]", text: "text-[#08786F]", border: "border-[#108B83]/30" };

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
      <div className="bg-[#FAFBFA] border border-[#D5E0E3] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#243847]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#3C5262] leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5E0E3]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#667986] hover:text-[#243847] transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition ${
              isDestructive ? "bg-rose-600 hover:bg-rose-700" : "bg-[#108B83] hover:bg-[#08786F]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
