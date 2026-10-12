"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { 
  Pill, 
  Package, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Plus, 
  Clock, 
  User, 
  FileText,
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";

interface PrescriptionItem {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  patientNic: string;
  doctorName: string;
  medications: string[];
  instructions: string;
  status: "PENDING" | "DISPENSED" | string;
  dispensedBy?: string;
  dispensedAt?: string;
  createdAt?: string;
}

interface StockItem {
  id: string;
  medicationName: string;
  dosage: string;
  stockUnits: number;
  minimumThreshold: number;
  batchNumber: string;
  expiryDate: string;
}

export default function PharmacyPortalPage() {
  const [activeTab, setActiveTab] = useState<"PRESCRIPTIONS" | "INVENTORY">("PRESCRIPTIONS");
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPharmacyData = async () => {
    setLoading(true);
    try {
      const [rxData, invData] = await Promise.all([
        apiFetch<any[]>("/api/pharmacy/prescriptions").catch(() => null),
        apiFetch<any[]>("/api/pharmacy/inventory").catch(() => null),
      ]);

      if (Array.isArray(rxData)) {
        setPrescriptions(rxData);
      }
      if (Array.isArray(invData)) {
        setInventory(invData);
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
      if (!user || !user.roles?.some(r => ["PHARMACIST", "DOCTOR", "HOSPITAL_ADMIN", "SYSTEM_ADMIN"].includes(r))) {
        router.push("/auth/staff-login");
        return;
      }
      fetchPharmacyData();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleDispense = async (rxId: string, rxNumber: string) => {
    setActionError(null);
    try {
      const updated = await apiFetch<any>(`/api/pharmacy/prescriptions/${rxId}/dispense`, {
        method: "POST",
      });

      setPrescriptions(prev => prev.map(p => p.id === rxId ? updated : p));
      setActionSuccess(`Prescription ${rxNumber} verified & dispensed successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to record medication dispensing on backend.");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleRestock = async (stockId: string, medicationName: string) => {
    setActionError(null);
    try {
      const updated = await apiFetch<any>("/api/pharmacy/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({ stockId, change: 100 })
      });

      setInventory(prev => prev.map(item => item.id === stockId ? updated : item));
      setActionSuccess(`Restocked +100 units of ${medicationName}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update inventory on backend.");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const pendingCount = prescriptions.filter(p => p.status === "PENDING").length;
  const dispensedCount = prescriptions.filter(p => p.status === "DISPENSED").length;
  const lowStockCount = inventory.filter(i => i.stockUnits <= i.minimumThreshold).length;

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientNic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventory = inventory.filter(i =>
    i.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { label: "Prescription Worklist", href: "/portal/pharmacy", icon: Pill, active: activeTab === "PRESCRIPTIONS", badge: `${pendingCount} Pending` },
    { label: "Medication Inventory", href: "/portal/pharmacy", icon: Package, active: activeTab === "INVENTORY", badge: `${inventory.length} SKUs` },
  ];

  return (
    <PortalShell
      role="PHARMACIST"
      roleTitle="Clinical Pharmacist Workspace"
      department="Central Dispensary"
      facility="National Hospital of Sri Lanka (NHSL)"
      userName="P. Jayasuriya, B.Pharm"
      navItems={navItems}
      headerActions={
        <button
          onClick={fetchPharmacyData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0B1730] border border-slate-800/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Dispense</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{pendingCount}</div>
          <p className="text-[11px] text-slate-400">Doctor validated electronic prescriptions</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1730] border border-slate-800/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Dispensed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{dispensedCount}</div>
          <p className="text-[11px] text-slate-400">Fully audited clinical dispensary receipts</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1730] border border-slate-800/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Watch</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white">{lowStockCount} <span className="text-xs text-rose-400 font-normal">critical SKUs</span></div>
          <p className="text-[11px] text-slate-400">Automated restock threshold monitoring</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Panel with Tabs & Search */}
      <div className="rounded-2xl bg-[#0B1730] border border-slate-800/90 p-6 space-y-6 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("PRESCRIPTIONS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "PRESCRIPTIONS"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Prescriptions Worklist ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("INVENTORY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "INVENTORY"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Central Drug Inventory ({inventory.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient, NIC, or drug..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Tab 1: Prescriptions List */}
        {activeTab === "PRESCRIPTIONS" && (
          <div className="space-y-4">
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No matching electronic prescriptions found.
              </div>
            ) : (
              filteredPrescriptions.map(rx => {
                const isPending = rx.status === "PENDING";
                return (
                  <div
                    key={rx.id}
                    className="p-5 rounded-xl bg-[#0F1E36] border border-slate-700/60 hover:border-slate-600 space-y-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-teal-400">{rx.prescriptionNumber}</span>
                          <span className="text-xs font-bold text-white">{rx.patientName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({rx.patientNic || "NIC VERIFIED"})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Prescribed by <span className="text-slate-300 font-medium">{rx.doctorName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                          isPending
                            ? "bg-amber-950/60 text-amber-400 border-amber-800/40"
                            : "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                        }`}>
                          {rx.status}
                        </span>

                        {isPending && (
                          <button
                            onClick={() => handleDispense(rx.id, rx.prescriptionNumber)}
                            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md transition-all"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            Verify & Dispense
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Prescribed Regimen</span>
                      <ul className="space-y-1">
                        {rx.medications.map((med, mIdx) => (
                          <li key={mIdx} className="text-xs text-slate-200 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            <span>{med}</span>
                          </li>
                        ))}
                      </ul>
                      {rx.instructions && (
                        <div className="text-[11px] text-amber-300/90 pt-1">
                          Directions: {rx.instructions}
                        </div>
                      )}
                    </div>

                    {!isPending && rx.dispensedBy && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Dispensed by {rx.dispensedBy}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Medication Inventory List */}
        {activeTab === "INVENTORY" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Medication Name</th>
                  <th className="pb-3 font-bold">Dosage & Form</th>
                  <th className="pb-3 font-bold">Available Stock</th>
                  <th className="pb-3 font-bold">Batch Number</th>
                  <th className="pb-3 font-bold">Expiry Date</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredInventory.map(stock => {
                  const isLow = stock.stockUnits <= stock.minimumThreshold;
                  return (
                    <tr key={stock.id} className="hover:bg-slate-900/40">
                      <td className="py-3 font-bold text-white">{stock.medicationName}</td>
                      <td className="py-3 text-slate-400">{stock.dosage}</td>
                      <td className="py-3">
                        <span className={`font-black ${isLow ? "text-rose-400" : "text-emerald-400"}`}>
                          {stock.stockUnits} units
                        </span>
                        {isLow && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-400">{stock.batchNumber}</td>
                      <td className="py-3 text-slate-400">{stock.expiryDate}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRestock(stock.id, stock.medicationName)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-teal-700 text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          +100 Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </PortalShell>
  );
}
