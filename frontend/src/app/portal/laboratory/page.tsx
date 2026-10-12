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
    { label: "Laboratory Worklist", href: "/portal/laboratory", icon: TestTube2, active: true, badge: `${orderedCount + collectedCount} Active` },
    { label: "Specimen Intake", href: "/portal/laboratory", icon: FlaskConical },
    { label: "Released Reports", href: "/portal/laboratory", icon: FileCheck, badge: `${releasedCount}` },
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0B1730] border border-slate-800/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Specimen</span>
            <TestTube2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{orderedCount}</div>
          <p className="text-[11px] text-slate-400">Arrived patients needing blood/specimen draw</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1730] border border-slate-800/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Testing / Processing</span>
            <Microscope className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400">{collectedCount}</div>
          <p className="text-[11px] text-slate-400">Specimens currently undergoing analysis</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1730] border border-slate-800/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Released Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{releasedCount}</div>
          <p className="text-[11px] text-slate-400">Validated reports accessible to doctors</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Order Manifest */}
      <div className="rounded-2xl bg-[#0B1730] border border-slate-800/90 p-6 space-y-6 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-400" />
              Diagnostic Investigation Manifest
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated test tubes tracking, analyzer results input, and electronic signing</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient, order, test..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
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
                  className="p-5 rounded-xl bg-[#0F1E36] border border-slate-700/60 hover:border-slate-600 space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-purple-400">{order.orderNumber}</span>
                        <span className="text-xs font-bold text-white">{order.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({order.patientNic || "NIC VERIFIED"})</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-teal-400" />
                        <span>{order.testType}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Ordered by {order.doctorName}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                        isOrdered
                          ? "bg-amber-950/60 text-amber-400 border-amber-800/40"
                          : isCollected
                          ? "bg-cyan-950/60 text-cyan-400 border-cyan-800/40"
                          : "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                      }`}>
                        {order.status.replace("_", " ")}
                      </span>

                      {isOrdered && (
                        <button
                          onClick={() => handleCollectSample(order.id, order.orderNumber)}
                          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <TestTube2 className="w-3.5 h-3.5" />
                          Draw Specimen
                        </button>
                      )}

                      {isCollected && (
                        <button
                          onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Microscope className="w-3.5 h-3.5" />
                          Enter Results
                        </button>
                      )}
                    </div>
                  </div>

                  {order.normalRange && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800">
                      Standard Reference Range: <span className="text-slate-300 font-medium">{order.normalRange}</span>
                    </div>
                  )}

                  {/* Results Input Modal/Drawer */}
                  {selectedOrderId === order.id && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-800/50 space-y-3">
                      <label className="block text-xs font-bold text-white">
                        Enter Lab Analyzer Observations & Values *
                      </label>
                      <textarea
                        rows={3}
                        value={resultInput}
                        onChange={e => setResultInput(e.target.value)}
                        placeholder="e.g. Fasting Blood Glucose: 92 mg/dL (Normal). HbA1c: 5.4%."
                        className="w-full px-3 py-2 bg-[#0F1E36] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRecordResults(order.id, order.orderNumber)}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Sign & Release Report
                        </button>
                      </div>
                    </div>
                  )}

                  {isReleased && order.resultsSummary && (
                    <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                      <div className="text-xs font-bold text-emerald-300">
                        Released Clinical Findings:
                      </div>
                      <div className="text-xs text-white">
                        {order.resultsSummary}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1">
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
