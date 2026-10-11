"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
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
      const token = localStorage.getItem("hc_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/reception/queue?facilityId=NHSL", {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
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
      }
    } catch (e) {
      // Retain fallback records if backend is temporarily unreachable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleGenerateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    const token = localStorage.getItem("hc_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

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
      const res = await fetch("http://localhost:8080/api/reception/ticket/issue", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
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
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate ticket via backend");
      }
    } catch (err: any) {
      // Graceful local generation if offline
      const tokenNum = `C-02${records.length + 3}`;
      const newRecord: CheckInRecord = {
        id: `CHK-${Math.floor(904 + Math.random() * 90)}`,
        token: tokenNum,
        patientName,
        nic: nic.substring(0, 4) + "*****" + nic.substring(nic.length - 2),
        clinic,
        priority,
        checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "CHECKED_IN",
      };

      setRecords((prev) => [newRecord, ...prev]);
      setIssuedTicket(newRecord);
      setActionSuccess(`Queue Token ${tokenNum} generated locally.`);
      setPatientName("");
      setNic("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTicket = async (ticketNum: string) => {
    try {
      const token = localStorage.getItem("hc_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`http://localhost:8080/api/reception/tickets/${ticketNum}/cancel`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      setRecords((prev) =>
        prev.map((r) => (r.token === ticketNum ? { ...r, status: "SKIPPED" } : r))
      );
      if (issuedTicket?.token === ticketNum) {
        setIssuedTicket(null);
      }
      setActionSuccess(`Ticket ${ticketNum} marked as cancelled.`);
    } catch (e) {
      setRecords((prev) =>
        prev.map((r) => (r.token === ticketNum ? { ...r, status: "SKIPPED" } : r))
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hc_staff_user");
    localStorage.removeItem("hc_token");
    router.push("/auth/staff-login");
  };

  return (
    <div className="min-h-screen bg-[#081225] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <header className="bg-[#0B1730] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="light" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950/60 text-teal-400 border border-teal-800/40">
                Reception & Check-in Desk
              </span>
              <span className="hidden md:inline-block text-xs text-slate-400">
                National Hospital of Sri Lanka (NHSL) • Main OPD Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchQueue}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Refresh Queue Manifest"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">Receptionist K. Wickramasinghe</div>
              <div className="text-[10px] text-teal-400">Desk Terminal #02</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
          <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800/80 text-teal-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-teal-400 hover:text-white">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Assisted Patient Check-In & Ticket Generator */}
          <div className="lg:col-span-5">
            <div className="bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-teal-400" />
                  Assisted Walk-In Check-In
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Issue instantaneous physical and digital clinic queue tokens linked to NHSL clinical sessions.
                </p>
              </div>

              {issuedTicket && (
                <div className="p-5 rounded-2xl bg-teal-950/60 border border-teal-800/60 text-teal-300 space-y-3">
                  <div className="flex items-center justify-between border-b border-teal-800/60 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Ticket Issued</span>
                    <button
                      onClick={() => alert(`Printing ticket receipt for token ${issuedTicket.token}...`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-200 hover:text-white bg-teal-900/60 px-2.5 py-1 rounded-lg"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Slip
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{issuedTicket.patientName}</div>
                      <div className="text-xs text-teal-400">{issuedTicket.clinic}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">NIC: {issuedTicket.nic}</div>
                    </div>
                    <div className="text-3xl font-black text-white bg-teal-900/80 px-3.5 py-1.5 rounded-xl border border-teal-600/40">
                      {issuedTicket.token}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleGenerateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rohitha Alwis"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    National Identity Card (NIC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    placeholder="e.g. 198812345678 or 881234567V"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Clinic Session *
                  </label>
                  <select
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Cardiology Clinic Room 04">Cardiology Clinic Room 04</option>
                    <option value="General OPD Room 01">General OPD Room 01</option>
                    <option value="Pediatrics Clinic Room 02">Pediatrics Clinic Room 02</option>
                    <option value="Diabetic Care Room 06">Diabetic Care Room 06</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Triage Priority Class
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Live Checked-In Patient Queue
                </h3>
                <p className="text-xs text-slate-400">{records.length} patients registered today at NHSL Desk 02</p>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Feed</span>
              </div>
            </div>

            <div className="space-y-3">
              {records.map((r) => {
                const isSkipped = r.status === "SKIPPED" || r.status === "CANCELLED";
                const isDone = r.status === "COMPLETED";
                const isInConsult = r.status === "IN_CONSULTATION";

                let statusBadge = "bg-teal-950/60 text-teal-400 border border-teal-800/40";
                if (isDone) statusBadge = "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40";
                if (isInConsult) statusBadge = "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40";
                if (isSkipped) statusBadge = "bg-rose-950/60 text-rose-400 border border-rose-800/40";

                return (
                  <div
                    key={r.id}
                    className={`p-5 rounded-xl bg-[#0F1E36] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSkipped ? "border-rose-950/40 opacity-60" : "border-slate-700/70 hover:border-slate-600"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-teal-400">{r.token}</span>
                        <span className="text-xs font-bold text-white">{r.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({r.nic})</span>
                      </div>
                      <p className="text-xs text-slate-300">{r.clinic}</p>
                      <div className="text-[11px] text-slate-400">Checked in at {r.checkInTime}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.priority === "PRIORITY"
                          ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                          : "bg-slate-800 text-slate-300"
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
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
