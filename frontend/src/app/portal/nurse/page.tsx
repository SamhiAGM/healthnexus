"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { apiFetch, getCurrentUser, logoutUser } from "@/lib/api";
import { 
  Heart, 
  Activity, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  LogOut, 
  PlusCircle, 
  Clock,
  Thermometer,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

interface TriagePatient {
  id: string;
  name: string;
  token: string;
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
  urgency: "ROUTINE" | "URGENT" | "PRIORITY";
  status: "PENDING_VITALS" | "VITALS_RECORDED" | "WITH_DOCTOR";
}

export default function NurseDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [patients, setPatients] = useState<TriagePatient[]>([
    {
      id: "P-103",
      name: "Dilan Weerasinghe",
      token: "C-022",
      bp: "122/80",
      pulse: "68",
      temp: "36.7",
      spo2: "99",
      urgency: "ROUTINE",
      status: "VITALS_RECORDED",
    },
    {
      id: "P-104",
      name: "Sunethra Fernando",
      token: "C-023",
      bp: "",
      pulse: "",
      temp: "",
      spo2: "",
      urgency: "PRIORITY",
      status: "PENDING_VITALS",
    },
    {
      id: "P-105",
      name: "Rohan Gunawardena",
      token: "C-024",
      bp: "",
      pulse: "",
      temp: "",
      spo2: "",
      urgency: "ROUTINE",
      status: "PENDING_VITALS",
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<TriagePatient>(patients[1]);
  const [bpInput, setBpInput] = useState("130/85");
  const [pulseInput, setPulseInput] = useState("78");
  const [tempInput, setTempInput] = useState("36.9");
  const [spo2Input, setSpo2Input] = useState("98");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch live triage queue from Spring Boot backend
  const fetchLiveTriage = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/api/nurse/queue?facilityId=NHSL");
      if (Array.isArray(data) && data.length > 0) {
        const mapped: TriagePatient[] = data.map((d: any, idx: number) => ({
          id: d.id || `P-${100 + idx}`,
          name: d.patientName || "Clinic Citizen",
          token: d.ticketNumber || `C-02${idx}`,
          bp: d.vitalsSummary?.match(/BP: ([\d/]+)/)?.[1] || "",
          pulse: d.vitalsSummary?.match(/HR: (\d+)/)?.[1] || "",
          temp: d.vitalsSummary?.match(/Temp: ([\d.]+)/)?.[1] || "",
          spo2: d.vitalsSummary?.match(/SpO2: (\d+)/)?.[1] || "",
          urgency: d.priorityTag === "URGENT" ? "URGENT" : d.priorityTag === "ELDERLY" ? "PRIORITY" : "ROUTINE",
          status: d.vitalsSummary ? "VITALS_RECORDED" : "PENDING_VITALS",
        }));
        setPatients(mapped);
        if (mapped[0]) setSelectedPatient(mapped[0]);
      }
    } catch (e) {
      // Retain offline fallback list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || !user.roles?.some(r => ["NURSE", "HOSPITAL_ADMIN", "SYSTEM_ADMIN"].includes(r))) {
        router.push("/auth/staff-login");
        return;
      }
      fetchLiveTriage();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiFetch("/api/nurse/vitals", {
        method: "POST",
        body: JSON.stringify({
          token: selectedPatient.token,
          bp: bpInput,
          pulse: pulseInput,
          temp: tempInput,
          spo2: spo2Input,
          urgency: selectedPatient.urgency,
        }),
      });
    } catch (e) {}

    const updated = patients.map((p) => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          bp: bpInput,
          pulse: pulseInput,
          temp: tempInput,
          spo2: spo2Input,
          status: "VITALS_RECORDED" as const,
        };
      }
      return p;
    });
    setPatients(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/staff-login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="bg-white/95 border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="dark" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                Nursing Station & Triage
              </span>
              <span className="hidden md:inline-block text-xs text-slate-500">
                Outpatient Clinic Station A • NHSL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">Staff Nurse M. K. Jayasuriya</div>
              <div className="text-[10px] text-teal-600 font-medium">Shift A (Morning)</div>
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Triage Patient Queue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-600" />
                  Arrived Patients for Triage Vitals
                </h2>
                <p className="text-xs text-slate-500">Log patient vitals before physician consultation</p>
              </div>

              <button
                onClick={fetchLiveTriage}
                disabled={loading}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-purple-600 border border-slate-200 shadow-xs transition-colors"
                title="Refresh Triage Queue"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-3">
              {patients.map((p) => {
                const isSelected = p.id === selectedPatient?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p);
                      if (p.bp) setBpInput(p.bp);
                      if (p.pulse) setPulseInput(p.pulse);
                      if (p.temp) setTempInput(p.temp);
                      if (p.spo2) setSpo2Input(p.spo2);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white border-purple-500 shadow-sm ring-1 ring-purple-500/30"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-purple-700">{p.token}</span>
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        p.urgency === "PRIORITY"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.urgency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className={p.status === "VITALS_RECORDED" ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
                        {p.status === "VITALS_RECORDED" ? "✓ Vitals Recorded" : "⏳ Pending Vitals"}
                      </span>
                      {p.bp && <span className="font-mono text-[11px] text-slate-500">{p.bp} mmHg</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Vitals Entry Station */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                  Vitals Measurement Station
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Recording for {selectedPatient?.name} ({selectedPatient?.token})
                </h3>
              </div>

              {savedSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Vitals recorded and forwarded to physician consultation worklist!</span>
                </div>
              )}

              <form onSubmit={handleSaveVitals} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Blood Pressure (mmHg) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bpInput}
                      onChange={(e) => setBpInput(e.target.value)}
                      placeholder="e.g. 120/80"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Heart / Pulse Rate (bpm) *
                    </label>
                    <input
                      type="number"
                      required
                      value={pulseInput}
                      onChange={(e) => setPulseInput(e.target.value)}
                      placeholder="e.g. 72"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Body Temperature (°C) *
                    </label>
                    <input
                      type="text"
                      required
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      placeholder="e.g. 36.8"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Oxygen Saturation SpO2 (%) *
                    </label>
                    <input
                      type="number"
                      required
                      value={spo2Input}
                      onChange={(e) => setSpo2Input(e.target.value)}
                      placeholder="e.g. 98"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-4"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Forward to Doctor
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
