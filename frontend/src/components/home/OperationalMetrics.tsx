"use client";

import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { 
  Activity, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  CalendarCheck
} from "lucide-react";

// Fictional synthetic healthcare operational activity for demonstration
const QUEUE_TREND_DATA = [
  { time: "07:30", patients: 45, attended: 12 },
  { time: "09:00", patients: 120, attended: 65 },
  { time: "10:30", patients: 185, attended: 140 },
  { time: "12:00", patients: 210, attended: 195 },
  { time: "13:30", patients: 160, attended: 155 },
  { time: "15:00", patients: 95, attended: 90 },
];

const CLINIC_SPECIALTY_DISTRIBUTION = [
  { clinic: "Cardiology", visits: 340 },
  { clinic: "General OPD", visits: 520 },
  { clinic: "Pediatrics", visits: 290 },
  { clinic: "Diabetic Care", visits: 410 },
  { clinic: "Orthopedics", visits: 230 },
];

export function OperationalMetrics() {
  const [activeTab, setActiveTab] = useState<"throughput" | "specialty">("throughput");

  return (
    <section className="py-24 bg-[#0B1730] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            Real-Time Operational Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Data-Driven Healthcare Operations
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Empowering administrators and clinical staff with transparent queue flow, clinic attendance, and triage throughput metrics.
          </p>
        </div>

        {/* Aggregate Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">Today's Visits</span>
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">1,790</div>
            <div className="text-xs text-teal-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>98% on-time digital triage</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">Avg. Waiting Time</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">18 <span className="text-base font-normal text-slate-400">mins</span></div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Down from 55 mins baseline</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Clinics</span>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">48</div>
            <div className="text-xs text-slate-400 mt-2">
              Across 9 Tertiary Hospitals
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">Field Inspections</span>
              <CalendarCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">114</div>
            <div className="text-xs text-teal-400 mt-2">
              92% Corrective actions verified
            </div>
          </div>
        </div>

        {/* Interactive Chart Container */}
        <div className="rounded-2xl bg-[#0F1E36] border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-700/60 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {activeTab === "throughput" ? "Island-Wide Queue Throughput (Today)" : "Visits by Clinical Specialty"}
              </h3>
              <p className="text-xs text-slate-400">
                Synthetic demonstration metrics derived from centralized hospital worklists.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab("throughput")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "throughput"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Hourly Flow
              </button>
              <button
                onClick={() => setActiveTab("specialty")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "specialty"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Specialty Breakdown
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "throughput" ? (
                <AreaChart data={QUEUE_TREND_DATA}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0F1E36", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="patients" stroke="#0D9488" fillOpacity={1} fill="url(#colorPatients)" name="Queue Total" />
                  <Area type="monotone" dataKey="attended" stroke="#2563EB" fillOpacity={1} fill="url(#colorAttended)" name="Consulted" />
                </AreaChart>
              ) : (
                <BarChart data={CLINIC_SPECIALTY_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="clinic" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0F1E36", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                  />
                  <Bar dataKey="visits" fill="#0D9488" radius={[6, 6, 0, 0]} name="Patient Visits" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
}
