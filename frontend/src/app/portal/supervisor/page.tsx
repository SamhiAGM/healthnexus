"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { 
  ClipboardCheck, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  FileCheck,
  TrendingUp, 
  RefreshCw,
  PlusCircle,
  Clock,
  ShieldCheck,
  Search
} from "lucide-react";
import { 
  PremiumStatCard, 
  ChartCard, 
  StatusIndicator, 
  EmptyState 
} from "@/components/portal/DashboardComponents";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

interface InspectionFinding {
  id: string;
  facility: string;
  category: "Sanitation & Sterilization" | "Cold Chain Storage" | "Emergency Drug Stocks" | "Fire Safety" | string;
  description: string;
  severity: "CRITICAL" | "MODERATE" | "LOW" | string;
  status: "OPEN" | "IN_PROGRESS" | "VERIFIED_CLOSED" | string;
  deadline: string;
}

const FACILITY_COMPLIANCE_DATA = [
  { facility: "NHSL Colombo", rate: 94 },
  { facility: "Kandy Hospital", rate: 88 },
  { facility: "BH Kinniya", rate: 92 },
  { facility: "TH Karapitiya", rate: 85 },
  { facility: "TH Jaffna", rate: 90 },
];

export default function SupervisorDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Senior Field Quality Supervisor");
  const [facilityName, setFacilityName] = useState("Western & Eastern Regional Directorate");

  const [findings, setFindings] = useState<InspectionFinding[]>([
    {
      id: "FND-301",
      facility: "Base Hospital Homagama",
      category: "Cold Chain Storage",
      description: "Vaccine storage refrigerator temperature sensor calibration required.",
      severity: "CRITICAL",
      status: "IN_PROGRESS",
      deadline: "15 Oct 2026",
    },
    {
      id: "FND-302",
      facility: "District General Hospital Gampaha",
      category: "Sanitation & Sterilization",
      description: "Sterile supply storage area air filtration inspection completed.",
      severity: "MODERATE",
      status: "VERIFIED_CLOSED",
      deadline: "20 Oct 2026",
    },
    {
      id: "FND-303",
      facility: "Provincial General Hospital Badulla",
      category: "Emergency Drug Stocks",
      description: "ETU adrenaline and atropine stock replenishment verified.",
      severity: "LOW",
      status: "VERIFIED_CLOSED",
      deadline: "10 Oct 2026",
    },
    {
      id: "FND-304",
      facility: "Base Hospital Kinniya",
      category: "Emergency Drug Stocks",
      description: "Laboratory reagent storage inventory verified according to MoH guidelines.",
      severity: "LOW",
      status: "VERIFIED_CLOSED",
      deadline: "25 Oct 2026",
    },
  ]);

  // Form for New Finding / Corrective Action
  const [newFacility, setNewFacility] = useState("National Hospital of Sri Lanka (NHSL)");
  const [newCategory, setNewCategory] = useState<string>("Cold Chain Storage");
  const [newDescription, setNewDescription] = useState("");
  const [newSeverity, setNewSeverity] = useState<string>("MODERATE");
  const [newDeadline, setNewDeadline] = useState("28 Oct 2026");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLiveFindings = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const data = await apiFetch<any[]>("/api/supervisor/findings");
      if (Array.isArray(data) && data.length > 0) {
        const mapped: InspectionFinding[] = data.map((d: any, idx: number) => ({
          id: d.findingCode || d.id || `FND-${300 + idx}`,
          facility: d.facility || "Government Base Hospital",
          category: d.category || "General Safety",
          description: d.description || "",
          severity: d.severity || "MODERATE",
          status: d.status || "OPEN",
          deadline: d.deadline || "30 Oct 2026",
        }));
        setFindings(mapped);
      }
    } catch (e) {
      // Retain fallback list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || !user.roles?.some(r => ["FIELD_SUPERVISOR", "HOSPITAL_ADMIN", "SYSTEM_ADMIN"].includes(r))) {
        router.push("/auth/staff-login");
        return;
      }
      if (user.fullName) setUserName(user.fullName);
      fetchLiveFindings();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    const payload = {
      facility: newFacility,
      category: newCategory,
      description: newDescription,
      severity: newSeverity,
      deadline: newDeadline,
    };

    try {
      const data = await apiFetch<any>("/api/supervisor/findings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created: InspectionFinding = {
        id: data.findingCode || data.id,
        facility: data.facility,
        category: data.category,
        description: data.description,
        severity: data.severity,
        status: data.status,
        deadline: data.deadline,
      };
      setFindings((prev) => [created, ...prev.filter(f => f.id !== created.id)]);
      setActionSuccess(`Finding ${created.id} dispatched to ${created.facility} administrators!`);
      setNewDescription("");
    } catch (err: any) {
      setActionError(err.message || "Failed to dispatch finding.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (id: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextStatus =
            f.status === "OPEN"
              ? "IN_PROGRESS"
              : f.status === "IN_PROGRESS"
              ? "VERIFIED_CLOSED"
              : "OPEN";
          return { ...f, status: nextStatus };
        }
        return f;
      })
    );

    try {
      await apiFetch(`/api/supervisor/findings/${id}/cycle-status`, {
        method: "POST",
      });
    } catch (e) {}
  };

  const navItems = [
    { label: "Supervision Audits", href: "/portal/supervisor", icon: ClipboardCheck, active: true },
    { label: "Public Health Officers", href: "/portal/public-health", icon: Building2 },
    { label: "Hospital Directory", href: "/hospitals", icon: MapPin },
  ];

  const closedCount = findings.filter(f => f.status === "VERIFIED_CLOSED").length;
  const inProgressCount = findings.filter(f => f.status === "IN_PROGRESS").length;

  const filteredFindings = findings.filter(f =>
    f.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalShell
      role="FIELD_SUPERVISOR"
      roleTitle="Field Supervision Officer"
      pageTitle="Facility Quality & Standards Supervision"
      department="Quality Governance & Audit Directorate"
      facility={facilityName}
      userName={userName}
      navItems={navItems}
      breadcrumbs={[
        { label: "Portal", href: "/portal/supervisor" },
        { label: "Field Supervision" }
      ]}
      headerActions={
        <button
          onClick={fetchLiveFindings}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F4F7] hover:bg-[#E8F0F4] border border-[#D9E3E9] text-xs font-bold text-[#087F79] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Audits</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumStatCard
            label="Inspected Facilities"
            value="14 Hospitals"
            subValue="Across 3 Provinces"
            icon={Building2}
            colorScheme="teal"
            badge="MoH Audit"
          />
          <PremiumStatCard
            label="Verified Closed"
            value={`${closedCount} Actions`}
            subValue={`${inProgressCount} currently in progress`}
            trend={{ value: "92% closure rate", positive: true }}
            icon={CheckCircle2}
            colorScheme="teal"
          />
          <PremiumStatCard
            label="Active Findings"
            value={`${findings.length - closedCount} Open`}
            subValue="Actionable items assigned"
            icon={AlertTriangle}
            colorScheme="coral"
          />
          <PremiumStatCard
            label="Average Resolution"
            value="4.2 Days"
            subValue="From report to closeout"
            icon={Clock}
            colorScheme="blue"
          />
        </div>

        {/* Supervision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Register New Finding Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-[#20364C] flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#087F79]" />
                  Log Institutional Finding
                </h3>
                <p className="text-xs text-[#43566C] mt-0.5">
                  Record corrective action requirements during hospital facility inspection.
                </p>
              </div>

              {actionSuccess && (
                <div className="p-3.5 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#087F79] shrink-0" />
                  <span className="font-bold">{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <form onSubmit={handleCreateFinding} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Healthcare Facility *
                  </label>
                  <select
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                  >
                    <option value="National Hospital of Sri Lanka (NHSL)">National Hospital of Sri Lanka (NHSL)</option>
                    <option value="Base Hospital Kinniya">Base Hospital Kinniya</option>
                    <option value="Base Hospital Homagama">Base Hospital Homagama</option>
                    <option value="District General Hospital Gampaha">District General Hospital Gampaha</option>
                    <option value="Provincial General Hospital Badulla">Provincial General Hospital Badulla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Inspection Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                  >
                    <option value="Cold Chain Storage">Cold Chain &amp; Vaccine Storage</option>
                    <option value="Sanitation & Sterilization">Sanitation &amp; Sterilization</option>
                    <option value="Emergency Drug Stocks">Emergency Drug Stocks</option>
                    <option value="Fire Safety & Evacuation">Fire Safety &amp; Evacuation</option>
                    <option value="Waste Disposal Protocols">Clinical Waste Disposal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Severity Level *
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                  >
                    <option value="LOW">Low (Monitor on regular cycle)</option>
                    <option value="MODERATE">Moderate (Corrective action in 14 days)</option>
                    <option value="CRITICAL">Critical (Immediate escalation required)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Deficiency Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Specific findings, calibration requirements, or physical facility observations..."
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{submitting ? "Transmitting..." : "Log & Dispatch Corrective Action"}</span>
                </button>
              </form>
            </div>

            {/* Compliance Chart */}
            <ChartCard title="Facility Compliance Performance" subtitle="Verified corrective action percentage" badge="2026">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FACILITY_COMPLIANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D9E3E9" />
                    <XAxis dataKey="facility" stroke="#43566C" fontSize={10} />
                    <YAxis stroke="#43566C" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "#F8FAFB", borderColor: "#D9E3E9", borderRadius: "12px", color: "#20364C" }} />
                    <Bar dataKey="rate" fill="#087F79" radius={[6, 6, 0, 0]} name="Compliance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Right Column: Inspection Findings List */}
          <div className="lg:col-span-7">
            <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E3E9] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#20364C]">Institutional Inspection Ledgers</h3>
                  <p className="text-xs text-[#43566C]">Active corrective actions and compliance tracking</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#43566C]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search findings or facility..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] focus:outline-none focus:ring-1 focus:ring-[#159B94]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 rounded-2xl bg-[#F0F4F7] border border-[#D9E3E9] hover:border-[#159B94] transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#087F79]">{finding.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            finding.severity === "CRITICAL" ? "bg-rose-100 text-rose-800" :
                            finding.severity === "MODERATE" ? "bg-amber-100 text-amber-800" :
                            "bg-[#DFEFEC] text-[#087F79]"
                          }`}>
                            {finding.severity}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#20364C] mt-1">{finding.facility}</h4>
                        <span className="text-[11px] text-[#426DA9] font-medium">{finding.category}</span>
                      </div>

                      <div className="text-right space-y-1.5">
                        <StatusIndicator status={finding.status} />
                        <button
                          onClick={() => handleStatusToggle(finding.id)}
                          className="block text-[11px] font-bold text-[#087F79] hover:underline"
                        >
                          Cycle Lifecycle Status &rarr;
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#364A5D] leading-relaxed">
                      {finding.description}
                    </p>

                    <div className="pt-2 border-t border-[#D9E3E9] flex items-center justify-between text-[11px] text-[#43566C]">
                      <span>Target Resolution: {finding.deadline}</span>
                      <span className="text-[#087F79] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Audited by Field Directorate
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
