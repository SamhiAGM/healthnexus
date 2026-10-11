"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { 
  Stethoscope, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Pill, 
  Activity, 
  ChevronRight, 
  LogOut,
  Building2,
  Send,
  UserCheck
} from "lucide-react";

interface PatientQueueItem {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: "M" | "F";
  complaint: string;
  vitals: string;
  status: "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED";
}

export default function DoctorDashboard() {
  const router = useRouter();

  const [queue, setQueue] = useState<PatientQueueItem[]>([
    {
      id: "P-101",
      token: "C-020",
      name: "Kasun Chamara Perera",
      age: 38,
      gender: "M",
      complaint: "Routine Cardiology follow-up & hypertension review",
      vitals: "BP: 128/84 mmHg, HR: 74 bpm, Temp: 36.8°C",
      status: "IN_CONSULTATION",
    },
    {
      id: "P-102",
      token: "C-021",
      name: "Nimali Rathnayake",
      age: 52,
      gender: "F",
      complaint: "Mild chest discomfort upon physical exertion",
      vitals: "BP: 140/90 mmHg, HR: 82 bpm, Temp: 36.6°C",
      status: "CALLED",
    },
    {
      id: "P-103",
      token: "C-022",
      name: "Dilan Weerasinghe",
      age: 44,
      gender: "M",
      complaint: "Medication refill and fasting blood glucose review",
      vitals: "BP: 122/80 mmHg, HR: 68 bpm, Temp: 36.7°C",
      status: "WAITING",
    },
    {
      id: "P-104",
      token: "C-023",
      name: "Sunethra Fernando",
      age: 61,
      gender: "F",
      complaint: "Post-operative follow-up",
      vitals: "BP: 130/82 mmHg, HR: 76 bpm, Temp: 37.0°C",
      status: "WAITING",
    },
  ]);

  const [activePatientIndex, setActivePatientIndex] = useState(0);
  const activePatient = queue[activePatientIndex];

  // Consultation Notes Form
  const [consultationNotes, setConsultationNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const [labOrders, setLabOrders] = useState("Resting 12-lead ECG");
  const [savedNotification, setSavedNotification] = useState(false);

  const handleStatusChange = (index: number, newStatus: PatientQueueItem["status"]) => {
    const updated = [...queue];
    updated[index].status = newStatus;
    setQueue(updated);
  };

  const handleCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    handleStatusChange(activePatientIndex, "COMPLETED");
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      if (activePatientIndex < queue.length - 1) {
        setActivePatientIndex(activePatientIndex + 1);
        handleStatusChange(activePatientIndex + 1, "IN_CONSULTATION");
        setConsultationNotes("");
        setPrescriptions("");
      }
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem("hc_staff_user");
    router.push("/auth/staff-login");
  };

  return (
    <div className="min-h-screen bg-[#081225] text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="bg-[#0B1730] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="light" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/40">
                Clinician Workspace
              </span>
              <span className="hidden md:inline-block text-xs text-slate-400">
                National Hospital of Sri Lanka (NHSL) • Cardiology Room 04
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">Dr. Samantha Senanayake, MBBS</div>
              <div className="text-[10px] text-teal-400">SLMC Reg: 64821</div>
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

      {/* Main Workspace */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Today's Assigned Queue List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Today's Clinic Queue
                </h2>
                <p className="text-xs text-slate-400">Morning Session • 4 Patients Assigned</p>
              </div>
              <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800/40 px-2.5 py-1 rounded-lg">
                Active Desk
              </span>
            </div>

            <div className="space-y-3">
              {queue.map((patient, index) => {
                const isActive = index === activePatientIndex;
                return (
                  <div
                    key={patient.id}
                    onClick={() => setActivePatientIndex(index)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#0F1E36] border-blue-500 shadow-md ring-1 ring-blue-500/50"
                        : "bg-[#0B1730]/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-blue-400">
                          {patient.token}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {patient.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        patient.status === "IN_CONSULTATION"
                          ? "bg-teal-950/60 text-teal-400 border border-teal-800/40"
                          : patient.status === "CALLED"
                          ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                          : patient.status === "COMPLETED"
                          ? "bg-slate-800 text-slate-400"
                          : "bg-blue-950/60 text-blue-400 border border-blue-800/40"
                      }`}>
                        {patient.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">{patient.complaint}</p>
                    <div className="mt-2 text-[11px] text-slate-500 font-mono">{patient.vitals}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Consultation Worklist & Order Entry */}
          <div className="lg:col-span-7">
            <div className="bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              
              {/* Active Patient Details Banner */}
              <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                      {activePatient.token}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{activePatient.name}</h3>
                      <div className="text-xs text-slate-400">
                        {activePatient.age} yrs • {activePatient.gender === "M" ? "Male" : "Female"} • Record ID: {activePatient.id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(activePatientIndex, "CALLED")}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-xs font-semibold border border-amber-600/30 transition-colors"
                    >
                      Call Token
                    </button>
                    <button
                      onClick={() => handleStatusChange(activePatientIndex, "IN_CONSULTATION")}
                      className="px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-xs font-semibold border border-teal-600/30 transition-colors"
                    >
                      Consulting
                    </button>
                  </div>
                </div>

                {/* Vitals Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span><strong>Triage Vitals:</strong> {activePatient.vitals}</span>
                  </div>
                  <span className="text-[10px] text-teal-400 font-semibold">Logged by Nurse</span>
                </div>
              </div>

              {savedNotification && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Consultation recorded successfully. Advancing queue ticket...</span>
                </div>
              )}

              {/* Consultation Input Form */}
              <form onSubmit={handleCompleteConsultation} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clinical Examination & Assessment Notes *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    placeholder="Document clinical observations, diagnosis, patient response..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Medication Prescriptions (Hospital Pharmacy Dispatch)
                    </label>
                    <input
                      type="text"
                      value={prescriptions}
                      onChange={(e) => setPrescriptions(e.target.value)}
                      placeholder="e.g. Amlodipine 5mg nocte, Atorvastatin 20mg"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Laboratory & Diagnostic Orders
                    </label>
                    <input
                      type="text"
                      value={labOrders}
                      onChange={(e) => setLabOrders(e.target.value)}
                      placeholder="e.g. Fasting Lipids, 12-lead ECG, HbA1c"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Complete Consultation
                </button>
              </form>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
