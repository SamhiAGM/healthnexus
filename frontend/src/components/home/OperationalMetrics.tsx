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
  CalendarCheck, 
  ShieldCheck, 
  Sparkles 
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
    <section className="py-24 bg-[#EDF2F4] text-[#3C5262] relative overflow-hidden border-t border-[#D5E0E3]">
      
      {/* Background Lighting */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#108B83]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DDEFE9] border border-[#108B83]/30 text-xs font-bold uppercase tracking-widest text-[#08786F]">
            <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
            Operational Intelligence &amp; Reporting
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
            Data-Driven Healthcare Operations
          </h2>
          <p className="text-[#667986] text-base sm:text-lg">
            Empowering hospital directors and clinical leaders with transparent queue flow, appointment utilization, and inspection verification trends.
          </p>
        </div>

        {/* Aggregate Highlight Cards with Demonstration Notice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="p-6 rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-2xs hover:border-[#108B83] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#698399] uppercase">Simulated Daily Visits</span>
              <Users className="w-5 h-5 text-[#108B83]" />
            </div>
            <div className="text-3xl font-extrabold text-[#243847]">1,790</div>
            <div className="text-xs text-[#08786F] font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Demonstration Queue Flow</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-2xs hover:border-[#467DA3] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#698399] uppercase">Avg. Waiting Time</span>
              <Clock className="w-5 h-5 text-[#467DA3]" />
            </div>
            <div className="text-3xl font-extrabold text-[#243847]">18 <span className="text-base font-normal text-[#698399]">mins</span></div>
            <div className="text-xs text-[#108B83] font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Projected Digital Triage Flow</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-2xs hover:border-[#108B83] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#698399] uppercase">Specialized Clinics</span>
              <Activity className="w-5 h-5 text-[#108B83]" />
            </div>
            <div className="text-3xl font-extrabold text-[#243847]">48 Active</div>
            <div className="text-xs text-[#667986] mt-2">
              Across 8 Tertiary &amp; Base Hospitals
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-2xs hover:border-[#467DA3] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#698399] uppercase">Supervision Audits</span>
              <CalendarCheck className="w-5 h-5 text-[#467DA3]" />
            </div>
            <div className="text-3xl font-extrabold text-[#243847]">114 Audits</div>
            <div className="text-xs text-[#08786F] font-semibold mt-2">
              92% Corrective actions verified
            </div>
          </div>

        </div>

        {/* Interactive Chart Container */}
        <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#D5E0E3] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-2 py-0.5 rounded-lg">
                  Demonstration Dataset
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#243847]">
                {activeTab === "throughput" ? "Simulated Hourly Queue Throughput" : "Clinic Attendance by Medical Specialty"}
              </h3>
              <p className="text-xs text-[#667986]">
                Aggregated operational graphs reflecting clinic check-in tokens and completed physician consultations.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#E7EFF1] p-1 rounded-2xl border border-[#D5E0E3]">
              <button
                onClick={() => setActiveTab("throughput")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === "throughput"
                    ? "bg-[#FAFBFA] text-[#243847] shadow-xs font-bold"
                    : "text-[#698399] hover:text-[#243847]"
                }`}
              >
                Hourly Queue Flow
              </button>
              <button
                onClick={() => setActiveTab("specialty")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === "specialty"
                    ? "bg-[#FAFBFA] text-[#243847] shadow-xs font-bold"
                    : "text-[#698399] hover:text-[#243847]"
                }`}
              >
                Specialty Distribution
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "throughput" ? (
                <AreaChart data={QUEUE_TREND_DATA}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#108B83" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#108B83" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#467DA3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#467DA3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D5E0E3" />
                  <XAxis dataKey="time" stroke="#698399" fontSize={12} />
                  <YAxis stroke="#698399" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FAFBFA", borderColor: "#D5E0E3", borderRadius: "16px", color: "#243847" }}
                  />
                  <Area type="monotone" dataKey="patients" stroke="#108B83" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" name="Patients in Queue" />
                  <Area type="monotone" dataKey="attended" stroke="#467DA3" strokeWidth={2} fillOpacity={1} fill="url(#colorAttended)" name="Consultations Completed" />
                </AreaChart>
              ) : (
                <BarChart data={CLINIC_SPECIALTY_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D5E0E3" />
                  <XAxis dataKey="clinic" stroke="#698399" fontSize={12} />
                  <YAxis stroke="#698399" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FAFBFA", borderColor: "#D5E0E3", borderRadius: "16px", color: "#243847" }}
                  />
                  <Bar dataKey="visits" fill="#108B83" radius={[8, 8, 0, 0]} name="Patient Consultations" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D5E0E3] flex items-center justify-between text-[11px] text-[#667986]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#108B83]" />
              In production, data is aggregated directly from Spring Boot Actuator &amp; MongoDB queries.
            </span>
            <span className="font-semibold text-[#108B83]">Interactive Recharts Engine</span>
          </div>

        </div>

      </div>
    </section>
  );
}
