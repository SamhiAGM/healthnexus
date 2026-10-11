"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
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
      const token = localStorage.getItem("hc_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/nurse/queue?facilityId=NHSL", {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
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
      }
    } catch (e) {
      // Retain fallback list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTriage();
  }, []);

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("hc_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("http://localhost:8080/api/nurse/vitals", {
        method: "POST",
        headers,
        credentials: "include",
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
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {}
    localStorage.removeItem("hc_staff_user");
    localStorage.removeItem("hc_token");
    router.push("/auth/staff-login");
  };

  return (
    <div className="min-h-screen bg-[#081225] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="bg-[#0B1730] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="light" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-400 border border-purple-800/40">
                Nursing Station & Triage
              </span>
              <span className="hidden md:inline-block text-xs text-slate-400">
                Outpatient Clinic Station A • NHSL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">Staff Nurse M. K. Jayasuriya</div>
              <div className="text-[10px] text-teal-400">Shift A (Morning)</div>
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Triage Patient Queue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                  Arrived Patients for Triage Vitals
                </h2>
                <p className="text-xs text-slate-400">Log patient vitals before physician consultation</p>
              </div>

              <button
                onClick={fetchLiveTriage}
                disabled={loading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 transition-colors"
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
                        ? "bg-[#0F1E36] border-purple-500 shadow-md ring-1 ring-purple-500/50"
                        : "bg-[#0B1730]/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-purple-400">{p.token}</span>
                        <span className="text-xs font-bold text-white">{p.name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        p.urgency === "PRIORITY"
                          ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {p.urgency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className={p.status === "VITALS_RECORDED" ? "text-emerald-400" : "text-amber-400"}>
                        {p.status === "VITALS_RECORDED" ? "✓ Vitals Recorded" : "⏳ Pending Vitals"}
                      </span>
                      {p.bp && <span className="font-mono text-[11px] text-slate-400">{p.bp} mmHg</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Vitals Entry Station */}
          <div className="lg:col-span-7">
            <div className="bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Vitals Measurement Station
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Recording for {selectedPatient?.name} ({selectedPatient?.token})
                </h3>
              </div>

              {savedSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Vitals recorded and forwarded to physician consultation worklist!</span>
                </div>
              )}

              <form onSubmit={handleSaveVitals} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Blood Pressure (mmHg) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bpInput}
                      onChange={(e) => setBpInput(e.target.value)}
                      placeholder="e.g. 120/80"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Heart / Pulse Rate (bpm) *
                    </label>
                    <input
                      type="number"
                      required
                      value={pulseInput}
                      onChange={(e) => setPulseInput(e.target.value)}
                      placeholder="e.g. 72"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Body Temperature (°C) *
                    </label>
                    <input
                      type="text"
                      required
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      placeholder="e.g. 36.8"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Oxygen Saturation SpO2 (%) *
                    </label>
                    <input
                      type="number"
                      required
                      value={spo2Input}
                      onChange={(e) => setSpo2Input(e.target.value)}
                      placeholder="e.g. 98"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
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
