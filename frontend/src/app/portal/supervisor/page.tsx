"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { apiFetch, getCurrentUser, logoutUser } from "@/lib/api";
import { 
  ClipboardCheck, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  LogOut, 
  FileCheck,
  ChevronRight,
  TrendingUp,
  Download,
  RefreshCw,
  XCircle,
  Loader2
} from "lucide-react";

interface InspectionFinding {
  id: string;
  facility: string;
  category: "Sanitation & Sterilization" | "Cold Chain Storage" | "Emergency Drug Stocks" | "Fire Safety" | string;
  description: string;
  severity: "CRITICAL" | "MODERATE" | "LOW" | string;
  status: "OPEN" | "IN_PROGRESS" | "VERIFIED_CLOSED" | string;
  deadline: string;
}

export default function SupervisorDashboard() {
  const router = useRouter();

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

  // Fetch live findings from Spring Boot backend
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
      // Retain fallback to initial findings if offline
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
    const prevFindings = [...findings];
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
    } catch (e) {
      // Revert if backend update failed
      setFindings(prevFindings);
      setActionError("Failed to update status on server.");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/staff-login");
  };

  const uniqueFacilities = new Set(findings.map((f) => f.facility)).size;
  const activeCount = findings.filter((f) => f.status !== "VERIFIED_CLOSED").length;
  const closedCount = findings.filter((f) => f.status === "VERIFIED_CLOSED").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="bg-white/95 border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="dark" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Digital Field Supervision
              </span>
              <span className="hidden md:inline-block text-xs text-slate-500">
                Ministry Institutional Quality Inspection Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchLiveFindings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-xs"
              title="Refresh Findings"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-rose-600 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">Supervisory Officer N. Bandara</div>
              <div className="text-[10px] text-teal-600 font-medium">Western & Central Provinces</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Metric Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-semibold">Active Findings</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {activeCount}
            </div>
            <span className="text-xs text-amber-700 mt-2 block font-medium">Requires facility verification</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-semibold">Verified Closed</span>
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">
              {closedCount}
            </div>
            <span className="text-xs text-slate-500 mt-2 block">100% audit trail logged</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-semibold">Facilities Monitored</span>
            <div className="text-3xl font-extrabold text-blue-700 mt-1">{uniqueFacilities} Facilities</div>
            <span className="text-xs text-teal-700 mt-2 block font-medium">Provincial Audit Cycle 2026</span>
          </div>
        </div>

        {/* Audit Findings & Action Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Corrective Actions List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-rose-600" />
                  Institutional Findings & Corrective-Action Lifecycle
                </h3>
                <p className="text-xs text-slate-500">Click status badge to advance verification state</p>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Active Registry</span>
              </div>
            </div>

            <div className="space-y-3">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 space-y-3 transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-rose-700">{f.id}</span>
                      <span className="text-xs font-bold text-slate-900">{f.facility}</span>
                    </div>

                    <button
                      onClick={() => handleStatusToggle(f.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        f.status === "VERIFIED_CLOSED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : f.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                      title="Click to cycle status"
                    >
                      {f.status.replace("_", " ")}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">{f.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Category: <strong className="text-slate-800">{f.category}</strong></span>
                    <span>Deadline: <strong className="text-slate-800">{f.deadline}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Log New Field Inspection Finding */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Field Inspection Finding</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Assign actionable corrective measures to hospital administrators.
                </p>
              </div>

              {actionSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{actionSuccess}</span>
                  </div>
                  <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              {actionError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                  <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-800">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateFinding} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inspected Facility *
                  </label>
                  <select
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="National Hospital of Sri Lanka (NHSL)">National Hospital of Sri Lanka (NHSL)</option>
                    <option value="Castle Street Hospital for Women">Castle Street Hospital for Women</option>
                    <option value="National Hospital Kandy">National Hospital Kandy</option>
                    <option value="Base Hospital Homagama">Base Hospital Homagama</option>
                    <option value="District General Hospital Gampaha">District General Hospital Gampaha</option>
                    <option value="Provincial General Hospital Badulla">Provincial General Hospital Badulla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inspection Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Sanitation & Sterilization">Sanitation & Sterilization</option>
                    <option value="Cold Chain Storage">Cold Chain Storage</option>
                    <option value="Emergency Drug Stocks">Emergency Drug Stocks</option>
                    <option value="Fire Safety">Fire Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Finding & Corrective Directive *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Specify the deficiency observed and required remedial actions..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Severity Level
                    </label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Remediation Deadline
                    </label>
                    <input
                      type="text"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Dispatching Directive...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Dispatch Corrective Action
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
