"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SRI_LANKAN_HOSPITALS, Hospital } from "@/lib/hospitalData";
import {
  Search,
  Building2,
  MapPin,
  Stethoscope,
  ArrowRight,
  X,
  Sparkles,
  Command,
  CornerDownLeft,
  Calendar,
  ShieldCheck,
  FileText,
  User,
  Phone
} from "lucide-react";

interface SearchResultItem {
  id: string;
  type: "hospital" | "service" | "page";
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
  icon: React.ElementType;
}

const PUBLIC_SERVICES: SearchResultItem[] = [
  {
    id: "service-queue",
    type: "service",
    title: "Live Hospital Clinic Queue Tracking",
    subtitle: "Real-time consultation queue token monitoring for outpatient clinics",
    badge: "Live OPD",
    href: "/#services",
    icon: Stethoscope,
  },
  {
    id: "service-appointments",
    type: "service",
    title: "Specialist Clinic Appointment Booking",
    subtitle: "Schedule consultations with leading consultant specialists across Sri Lanka",
    badge: "Booking",
    href: "/#services",
    icon: Calendar,
  },
  {
    id: "service-lab",
    type: "service",
    title: "Digital Diagnostic & Lab Reports",
    subtitle: "Securely retrieve verified laboratory investigations and test summaries",
    badge: "Diagnostic",
    href: "/#services",
    icon: FileText,
  },
  {
    id: "service-pharmacy",
    type: "service",
    title: "Government Hospital Drug Dispensing",
    subtitle: "Essential medication availability and e-prescription fulfillment tracking",
    badge: "Pharmacy",
    href: "/#services",
    icon: Sparkles,
  },
  {
    id: "page-hospitals",
    type: "page",
    title: "Nationwide Hospital Directory 2026",
    subtitle: "Explore 40+ verified Ministry of Health teaching and base hospitals",
    badge: "Directory",
    href: "/hospitals",
    icon: Building2,
  },
  {
    id: "page-patient-login",
    type: "page",
    title: "Citizen & Patient Portal Sign In",
    subtitle: "Access personal queue tokens, medical summaries, and appointments",
    badge: "Portal",
    href: "/auth/patient-login",
    icon: User,
  },
  {
    id: "page-staff-portal",
    type: "page",
    title: "Healthcare Professional & Staff Portal",
    subtitle: "Authorized portal for Doctors, Nurses, Pharmacists, and Administrators",
    badge: "Staff",
    href: "/auth/staff-login",
    icon: ShieldCheck,
  },
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered results
  const filteredResults = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default recommended results
      return [
        ...PUBLIC_SERVICES.slice(0, 4),
        {
          id: "hosp-kinniya",
          type: "hospital",
          title: "Base Hospital Kinniya",
          subtitle: "Trincomalee &bull; Eastern Province &bull; Type A Base Hospital",
          badge: "Featured",
          href: "/hospitals?search=Kinniya",
          icon: Building2,
        },
        {
          id: "hosp-nhsl",
          type: "hospital",
          title: "National Hospital of Sri Lanka (NHSL)",
          subtitle: "Colombo &bull; Western Province &bull; National Apex Hospital",
          badge: "Apex",
          href: "/hospitals?search=National+Hospital",
          icon: Building2,
        },
      ];
    }

    const matches: SearchResultItem[] = [];

    // Search hospitals
    for (const hosp of SRI_LANKAN_HOSPITALS) {
      const matchName = hosp.name.toLowerCase().includes(q);
      const matchCity = hosp.city.toLowerCase().includes(q);
      const matchDistrict = hosp.district.toLowerCase().includes(q);
      const matchProvince = hosp.province.toLowerCase().includes(q);
      const matchCategory = hosp.category.toLowerCase().includes(q);

      if (matchName || matchCity || matchDistrict || matchProvince || matchCategory) {
        matches.push({
          id: hosp.id,
          type: "hospital",
          title: hosp.name,
          subtitle: `${hosp.city}, ${hosp.district} &bull; ${hosp.category}`,
          badge: hosp.district,
          href: `/hospitals?search=${encodeURIComponent(hosp.name)}`,
          icon: Building2,
        });
      }
    }

    // Search services & pages
    for (const s of PUBLIC_SERVICES) {
      if (
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        (s.badge && s.badge.toLowerCase().includes(q))
      ) {
        matches.push(s);
      }
    }

    return matches.slice(0, 8);
  }, [query]);

  // Keyboard navigation through results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        router.push(filteredResults[selectedIndex].href);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#20364C]/50 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D9E3E9] bg-white">
          <Search className="w-5 h-5 text-[#087F79] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search hospitals, districts, OPD clinics, or services... (e.g. Kinniya, Colombo, Queue)"
            className="flex-1 bg-transparent text-[#20364C] placeholder-[#43566C]/60 text-sm sm:text-base focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-[#43566C] hover:text-[#20364C] hover:bg-[#E8F0F4]"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-[#43566C] px-2 py-1 rounded bg-[#E8F0F4] border border-[#D9E3E9]">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Building2 className="w-10 h-10 text-[#43566C]/40 mx-auto" />
              <p className="text-sm font-semibold text-[#20364C]">No hospital or service matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#43566C]">
                Try searching by district (e.g. Trincomalee, Kandy, Galle) or browse the{" "}
                <Link 
                  href="/hospitals" 
                  onClick={onClose} 
                  className="text-[#087F79] font-bold underline hover:text-[#159B94]"
                >
                  Full Hospital Directory
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="px-3 py-1 text-[11px] font-bold text-[#43566C] uppercase tracking-wider">
                {query ? `Matching Results (${filteredResults.length})` : "Recommended Quick Access"}
              </div>

              {filteredResults.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[#DFEFEC] border border-[#159B94]/30 shadow-xs"
                        : "hover:bg-[#E8F0F4] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        item.type === "hospital"
                          ? "bg-[#DFEFEC] text-[#087F79]"
                          : item.type === "service"
                            ? "bg-[#EBE8F5] text-[#426DA9]"
                            : "bg-[#E8F0F4] text-[#43566C]"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#20364C] truncate flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#D9E3E9] text-[#087F79] shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#364A5D] truncate" dangerouslySetInnerHTML={{ __html: item.subtitle }} />
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? "text-[#087F79] translate-x-1" : "text-[#43566C]/40"
                    }`} />
                  </Link>
                );
              })}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 bg-[#E8F0F4] border-t border-[#D9E3E9] flex items-center justify-between text-[11px] text-[#43566C]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D9E3E9] font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D9E3E9] font-mono text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D9E3E9] font-mono text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <Link
            href="/hospitals"
            onClick={onClose}
            className="text-[#087F79] hover:underline font-semibold"
          >
            All 40+ Hospitals →
          </Link>
        </div>
      </div>
    </div>
  );
}
