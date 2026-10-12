"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { apiFetch, getCurrentUser, logoutUser } from "@/lib/api";
import { 
  Building2, 
  Search, 
  UserCheck, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Calendar,
  Users,
  Printer,
  RefreshCw,
  XCircle,
  Loader2
} from "lucide-react";

interface CheckInRecord {
  id: string;
  token: string;
  patientName: string;
  nic: string;
  clinic: string;
  priority: "ROUTINE" | "PRIORITY" | "SENIOR_CITIZEN" | string;
  checkInTime: string;
  status: "CHECKED_IN" | "SENT_TO_TRIAGE" | "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "SKIPPED" | string;
}

export default function ReceptionDashboard() {
  const router = useRouter();

  const [records, setRecords] = useState<CheckInRecord[]>([
    {
      id: "CHK-901",
      token: "C-020",
      patientName: "Kasun Chamara Perera",
      nic: "1995*****678",
      clinic: "Cardiology Clinic Room 04",
      priority: "ROUTINE",
      checkInTime: "08:15 AM",
      status: "SENT_TO_TRIAGE",
    },
    {
      id: "CHK-902",
      token: "C-021",
      patientName: "Nimali Rathnayake",
      nic: "1974*****123",
      clinic: "Cardiology Clinic Room 04",
      priority: "PRIORITY",
      checkInTime: "08:30 AM",
      status: "SENT_TO_TRIAGE",
    },
    {
      id: "CHK-903",
      token: "C-022",
      patientName: "Dilan Weerasinghe",
      nic: "1982*****456",
      clinic: "Cardiology Clinic Room 04",
      priority: "ROUTINE",
      checkInTime: "08:45 AM",
      status: "CHECKED_IN",
    },
  ]);

  // Assisted Walk-In Check-In Form
  const [patientName, setPatientName] = useState("");
  const [nic, setNic] = useState("");
  const [clinic, setClinic] = useState("Cardiology Clinic Room 04");
  const [priority, setPriority] = useState<string>("ROUTINE");
  const [issuedTicket, setIssuedTicket] = useState<CheckInRecord | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fetch live queue manifest from Spring Boot backend
  const fetchQueue = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const data = await apiFetch<any[]>("/api/reception/queue?facilityId=NHSL");
      if (Array.isArray(data) && data.length > 0) {
        const mapped: CheckInRecord[] = data.map((d: any, idx: number) => {
          const rawNic = d.patientNic || "";
          const maskedNic = rawNic.length >= 6 
            ? rawNic.substring(0, 4) + "*****" + rawNic.substring(rawNic.length - 2) 
            : rawNic || "N/A";
          const dateStr = d.createdAt 
            ? new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
            : "08:30 AM";
          return {
            id: d.id || `CHK-${idx}`,
            token: d.ticketNumber || `C-02${idx}`,
            patientName: d.patientName || "Clinic Patient",
            nic: maskedNic,
            clinic: d.clinicType || "Cardiology Clinic Room 04",
            priority: d.priorityTag || "ROUTINE",
            checkInTime: dateStr,
            status: d.status || "WAITING",
          };
        });
        setRecords(mapped);
      }
    } catch (e) {
      // Retain fallback records if backend is temporarily unreachable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || (!user.roles?.includes("RECEPTIONIST") && !user.roles?.includes("SYSTEM_ADMIN") && !user.roles?.includes("HOSPITAL_ADMIN"))) {
        router.push("/auth/staff-login");
        return;
      }
      fetchQueue();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleGenerateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);


    const payload = {
      patientName,
      patientNic: nic,
      clinicType: clinic,
      priorityTag: priority,
      consultationRoom: clinic.includes("Room") ? clinic.substring(clinic.indexOf("Room")) : "Room 04",
      facilityId: "NHSL",
      facilityName: "National Hospital of Sri Lanka (NHSL)",
    };

    try {
      const data = await apiFetch<any>("/api/reception/ticket/issue", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const rawNic = data.patientNic || nic;
      const masked = rawNic.length >= 6 ? rawNic.substring(0, 4) + "*****" + rawNic.substring(rawNic.length - 2) : rawNic;
      const newRecord: CheckInRecord = {
        id: data.id || `CHK-${Date.now()}`,
        token: data.ticketNumber,
        patientName: data.patientName,
        nic: masked,
        clinic: data.clinicType,
        priority: data.priorityTag,
        checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: data.status,
      };
      setRecords((prev) => [newRecord, ...prev.filter(r => r.token !== newRecord.token)]);
      setIssuedTicket(newRecord);
      setActionSuccess(`Queue Token ${data.ticketNumber} generated successfully for ${data.patientName}.`);
      setPatientName("");
      setNic("");
    } catch (err: any) {
      setActionError(err.message || "Failed to generate queue token via backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTicket = async (ticketNum: string) => {
    try {
      await apiFetch(`/api/reception/tickets/${ticketNum}/cancel`, {
        method: "POST",
      });

      setRecords((prev) =>
        prev.map((r) => (r.token === ticketNum ? { ...r, status: "SKIPPED" } : r))
      );
      if (issuedTicket?.token === ticketNum) {
        setIssuedTicket(null);
      }
      setActionSuccess(`Ticket ${ticketNum} marked as cancelled.`);
    } catch (err: any) {
      setActionError(err.message || `Failed to cancel ticket ${ticketNum}.`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/staff-login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <header className="bg-white/95 border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="dark" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                Reception & Check-in Desk
              </span>
              <span className="hidden md:inline-block text-xs text-slate-500">
                National Hospital of Sri Lanka (NHSL) • Main OPD Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchQueue}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-xs"
              title="Refresh Queue Manifest"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">Receptionist K. Wickramasinghe</div>
              <div className="text-[10px] text-teal-600 font-medium">Desk Terminal #02</div>
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-teal-600 hover:text-teal-800">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-800">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Assisted Patient Check-In & Ticket Generator */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-teal-600" />
                  Assisted Walk-In Check-In
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Issue instantaneous physical and digital clinic queue tokens linked to NHSL clinical sessions.
                </p>
              </div>

              {issuedTicket && (
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-3">
                  <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Ticket Issued</span>
                    <button
                      onClick={() => alert(`Printing ticket receipt for token ${issuedTicket.token}...`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-950 bg-teal-100 px-2.5 py-1 rounded-lg"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Slip
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{issuedTicket.patientName}</div>
                      <div className="text-xs text-teal-700 font-medium">{issuedTicket.clinic}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">NIC: {issuedTicket.nic}</div>
                    </div>
                    <div className="text-3xl font-black text-white bg-teal-600 px-3.5 py-1.5 rounded-xl shadow-xs">
                      {issuedTicket.token}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleGenerateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rohitha Alwis"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    National Identity Card (NIC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    placeholder="e.g. 198812345678 or 881234567V"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Clinic Session *
                  </label>
                  <select
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Cardiology Clinic Room 04">Cardiology Clinic Room 04</option>
                    <option value="General OPD Room 01">General OPD Room 01</option>
                    <option value="Pediatrics Clinic Room 02">Pediatrics Clinic Room 02</option>
                    <option value="Diabetic Care Room 06">Diabetic Care Room 06</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Triage Priority Class
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ROUTINE">ROUTINE</option>
                    <option value="PRIORITY">PRIORITY (High Urgency)</option>
                    <option value="SENIOR_CITIZEN">SENIOR CITIZEN</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Issuing Token...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      Generate Queue Token
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Check-in Activity & Queue Manifest */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  Live Checked-In Patient Queue
                </h3>
                <p className="text-xs text-slate-500">{records.length} patients registered today at NHSL Desk 02</p>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Feed</span>
              </div>
            </div>

            <div className="space-y-3">
              {records.map((r) => {
                const isSkipped = r.status === "SKIPPED" || r.status === "CANCELLED";
                const isDone = r.status === "COMPLETED";
                const isInConsult = r.status === "IN_CONSULTATION";

                let statusBadge = "bg-teal-50 text-teal-700 border border-teal-200";
                if (isDone) statusBadge = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                if (isInConsult) statusBadge = "bg-cyan-50 text-cyan-700 border border-cyan-200";
                if (isSkipped) statusBadge = "bg-rose-50 text-rose-700 border border-rose-200";

                return (
                  <div
                    key={r.id}
                    className={`p-5 rounded-xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                      isSkipped ? "border-rose-200 opacity-60" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-teal-700">{r.token}</span>
                        <span className="text-xs font-bold text-slate-900">{r.patientName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({r.nic})</span>
                      </div>
                      <p className="text-xs text-slate-600">{r.clinic}</p>
                      <div className="text-[11px] text-slate-500">Checked in at {r.checkInTime}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.priority === "PRIORITY"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {r.priority}
                      </span>

                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${statusBadge}`}>
                        {r.status.replace("_", " ")}
                      </span>

                      {!isSkipped && !isDone && (
                        <button
                          onClick={() => handleCancelTicket(r.token)}
                          title="Cancel ticket if patient departed"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
