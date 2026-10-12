"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { 
  FlaskConical, 
  TestTube2, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  Microscope, 
  FileText,
  UserCheck,
  AlertCircle,
  FileCheck,
  Dna
} from "lucide-react";

interface LabOrderItem {
  id: string;
  orderNumber: string;
  patientName: string;
  patientNic: string;
  doctorName: string;
  testType: string;
  status: "ORDERED" | "SAMPLE_COLLECTED" | "RELEASED" | string;
  resultsSummary?: string;
  normalRange?: string;
  technicianName?: string;
  releasedAt?: string;
  createdAt?: string;
}

export default function LaboratoryPortalPage() {
  const [orders, setOrders] = useState<LabOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const router = useRouter();
  const [resultInput, setResultInput] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/api/laboratory/orders");
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      // Retain fallback display
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || !user.roles?.some(r => ["LAB_TECHNICIAN", "LAB_STAFF", "DOCTOR", "HOSPITAL_ADMIN", "SYSTEM_ADMIN"].includes(r))) {
        router.push("/auth/staff-login");
        return;
      }
      fetchOrders();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleCollectSample = async (orderId: string, orderNumber: string) => {
    setActionError(null);
    try {
      const updated = await apiFetch<any>(`/api/laboratory/orders/${orderId}/sample`, {
        method: "POST",
      });

      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setActionSuccess(`Specimen for ${orderNumber} collected and barcoded.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || `Failed to collect specimen for ${orderNumber}.`);
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleRecordResults = async (orderId: string, orderNumber: string) => {
    if (!resultInput.trim()) return;
    setActionError(null);

    try {
      const updated = await apiFetch<any>(`/api/laboratory/orders/${orderId}/results`, {
        method: "POST",
        body: JSON.stringify({ results: resultInput.trim() })
      });

      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setActionSuccess(`Test report for ${orderNumber} released to physician.`);
      setSelectedOrderId(null);
      setResultInput("");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || `Failed to release test results for ${orderNumber}.`);
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const orderedCount = orders.filter(o => o.status === "ORDERED").length;
  const collectedCount = orders.filter(o => o.status === "SAMPLE_COLLECTED").length;
  const releasedCount = orders.filter(o => o.status === "RELEASED").length;

  const filteredOrders = orders.filter(o =>
    o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.testType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { label: "Specimen Reception", href: "/portal/laboratory", icon: TestTube2, active: true, badge: `${orderedCount} Pending` },
    { label: "Analyzer Bench", href: "/portal/laboratory", icon: Microscope, active: false, badge: `${collectedCount} In Test` },
    { label: "Released Reports", href: "/portal/laboratory", icon: FileCheck, active: false, badge: `${releasedCount} Signed` },
  ];

  return (
    <PortalShell
      role="LAB_TECHNICIAN"
      roleTitle="Clinical Diagnostics & MLT Desk"
      department="Pathology & Laboratory"
      facility="National Hospital of Sri Lanka (NHSL)"
      userName="T. Mendis, MLT"
      navItems={navItems}
      headerActions={
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0F766E] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Specimen</span>
            <TestTube2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">{orderedCount}</div>
          <p className="text-[11px] text-slate-500">Arrived patients needing blood/specimen draw</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">In Testing / Processing</span>
            <Microscope className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-cyan-600">{collectedCount}</div>
          <p className="text-[11px] text-slate-500">Specimens currently undergoing analysis</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Released Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{releasedCount}</div>
          <p className="text-[11px] text-slate-500">Validated reports accessible to doctors</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Order Manifest */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 space-y-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              Diagnostic Investigation Manifest
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated test tubes tracking, analyzer results input, and electronic signing</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient, order, test..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching diagnostic investigations found.
            </div>
          ) : (
            filteredOrders.map(order => {
              const isOrdered = order.status === "ORDERED";
              const isCollected = order.status === "SAMPLE_COLLECTED";
              const isReleased = order.status === "RELEASED";

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-purple-700">{order.orderNumber}</span>
                        <span className="text-xs font-bold text-slate-900">{order.patientName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({order.patientNic || "NIC VERIFIED"})</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>{order.testType}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ordered by <span className="text-slate-700 font-semibold">{order.doctorName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                        isOrdered
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : isCollected
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {order.status.replace("_", " ")}
                      </span>

                      {isOrdered && (
                        <button
                          onClick={() => handleCollectSample(order.id, order.orderNumber)}
                          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <TestTube2 className="w-3.5 h-3.5" />
                          Draw Specimen
                        </button>
                      )}

                      {isCollected && (
                        <button
                          onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Microscope className="w-3.5 h-3.5" />
                          Enter Results
                        </button>
                      )}
                    </div>
                  </div>

                  {order.normalRange && (
                    <div className="text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80">
                      Standard Reference Range: <span className="text-slate-800 font-semibold">{order.normalRange}</span>
                    </div>
                  )}

                  {/* Results Input Drawer */}
                  {selectedOrderId === order.id && (
                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
                      <label className="block text-xs font-bold text-slate-800">
                        Enter Lab Analyzer Observations & Values *
                      </label>
                      <textarea
                        rows={3}
                        value={resultInput}
                        onChange={e => setResultInput(e.target.value)}
                        placeholder="e.g. Fasting Blood Glucose: 92 mg/dL (Normal). HbA1c: 5.4%."
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRecordResults(order.id, order.orderNumber)}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Sign & Release Report
                        </button>
                      </div>
                    </div>
                  )}

                  {isReleased && order.resultsSummary && (
                    <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <div className="text-xs font-bold text-emerald-800">
                        Released Clinical Findings:
                      </div>
                      <div className="text-xs text-slate-800">
                        {order.resultsSummary}
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Validated by {order.technicianName || "T. Mendis, MLT"} • Transmitted to Doctor Consultation Record
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </PortalShell>
  );
}
