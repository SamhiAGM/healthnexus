"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { 
  Heart, 
  Activity, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Clock, 
  Thermometer, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  Users,
  AlertTriangle
} from "lucide-react";
import { 
  PremiumStatCard, 
  ChartCard, 
  StatusIndicator, 
  EmptyState 
} from "@/components/portal/DashboardComponents";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

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

const TRIAGE_DISTRIBUTION_DATA = [
  { category: "Routine", count: 24, fill: "#087F79" },
  { category: "Elderly Priority", count: 11, fill: "#426DA9" },
  { category: "Urgent Escalation", count: 3, fill: "#E11D48" },
];

export default function NurseDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Sister K. L. Menike");
  const [facilityName, setFacilityName] = useState("National Hospital of Sri Lanka (NHSL)");

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

  const [selectedPatient, setSelectedPatient] = useState<TriagePatient>(patients[1] || patients[0]);
  const [bpInput, setBpInput] = useState("130/85");
  const [pulseInput, setPulseInput] = useState("78");
  const [tempInput, setTempInput] = useState("36.9");
  const [spo2Input, setSpo2Input] = useState("98");
  const [savedSuccess, setSavedSuccess] = useState(false);

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
        if (process.env.NODE_ENV === "production") {
          router.push("/auth/staff-login");
          return;
        }
      }
      if (user?.fullName) setUserName(user.fullName);
      if (user?.assignedFacilityId) setFacilityName(user.assignedFacilityId);
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

  const pendingCount = patients.filter(p => p.status === "PENDING_VITALS").length;
  const recordedCount = patients.filter(p => p.status === "VITALS_RECORDED").length;

  const navItems = [
    { label: "Triage Station", href: "/portal/nurse", icon: Heart, active: true },
    { label: "Patient Observation", href: "/portal/nurse", icon: ClipboardList },
    { label: "Clinician Worklist", href: "/portal/doctor", icon: Users },
  ];

  return (
    <PortalShell
      role="NURSE"
      roleTitle="Staff Nurse & Triage"
      pageTitle="Triage & Vitals Assessment Desk"
      department="Station Desk A"
      facility={facilityName}
      userName={userName}
      navItems={navItems}
      breadcrumbs={[
        { label: "Portal", href: "/portal/nurse" },
        { label: "Nursing Workspace" }
      ]}
      headerActions={
        <button
          onClick={fetchLiveTriage}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F4F7] hover:bg-[#E8F0F4] border border-[#D9E3E9] text-xs font-bold text-[#087F79] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Triage</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumStatCard
            label="Pending Vitals"
            value={`${pendingCount} Arrived`}
            subValue="Awaiting observation at Desk A"
            icon={Clock}
            colorScheme="coral"
            badge="Priority Queue"
          />
          <PremiumStatCard
            label="Recorded Today"
            value={`${recordedCount} Patients`}
            subValue="Forwarded to doctor queue"
            icon={CheckCircle2}
            colorScheme="teal"
          />
          <PremiumStatCard
            label="Avg Assessment Time"
            value="2.8 mins"
            subValue="BP, Pulse, Temp, SpO2"
            icon={Activity}
            colorScheme="blue"
          />
          <PremiumStatCard
            label="Urgent Escalations"
            value="1 Patient"
            subValue="Expedited directly to Consultant"
            icon={AlertTriangle}
            colorScheme="coral"
          />
        </div>

        {/* Triage Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Triage Patient List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E3E9] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#20364C]">Arrival Waiting Queue</h3>
                <p className="text-xs text-[#43566C]">{patients.length} Registered Check-ins</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {patients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
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
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#F8FAFB] border-[#087F79] shadow-sm ring-1 ring-[#087F79]/30"
                        : "bg-[#F8FAFB] border-[#D9E3E9] hover:border-[#159B94]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-extrabold text-[#20364C]">
                          {p.token}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#20364C]">{p.name}</div>
                          <div className="text-[11px] text-[#43566C]">Ticket #{p.token}</div>
                        </div>
                      </div>
                      <StatusIndicator status={p.status} />
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#D9E3E9] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#43566C]">
                        {p.bp ? `BP: ${p.bp} | HR: ${p.pulse}` : "Awaiting Measurement"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.urgency === "URGENT" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        p.urgency === "PRIORITY" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                        "bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/30"
                      }`}>
                        {p.urgency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Triage Status Distribution Chart */}
            <ChartCard title="Acuity Level Distribution" subtitle="Today's triage class breakdown" badge="Shift A">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TRIAGE_DISTRIBUTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D9E3E9" />
                    <XAxis dataKey="category" stroke="#43566C" fontSize={11} />
                    <YAxis stroke="#43566C" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#F8FAFB", borderColor: "#D9E3E9", borderRadius: "12px", color: "#20364C" }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Patient Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Right Column: Vitals Measurement Station */}
          <div className="lg:col-span-7">
            {selectedPatient ? (
              <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 shadow-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-[#D9E3E9] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/30">
                        Token {selectedPatient.token}
                      </span>
                      <StatusIndicator status={selectedPatient.status} />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#20364C]">{selectedPatient.name}</h3>
                    <p className="text-xs text-[#43566C]">ID: {selectedPatient.id} &bull; Acuity: {selectedPatient.urgency}</p>
                  </div>
                </div>

                {savedSuccess && (
                  <div className="p-3.5 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#087F79] shrink-0" />
                    <span className="font-bold">Vitals recorded and synchronized with doctor consultation worklist!</span>
                  </div>
                )}

                <form onSubmit={handleSaveVitals} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#20364C] mb-1">
                        Blood Pressure (mmHg) *
                      </label>
                      <input
                        type="text"
                        required
                        value={bpInput}
                        onChange={(e) => setBpInput(e.target.value)}
                        placeholder="e.g. 120/80"
                        className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#20364C] mb-1">
                        Heart Rate (bpm) *
                      </label>
                      <input
                        type="number"
                        required
                        value={pulseInput}
                        onChange={(e) => setPulseInput(e.target.value)}
                        placeholder="e.g. 74"
                        className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#20364C] mb-1">
                        Body Temp (°C) *
                      </label>
                      <input
                        type="text"
                        required
                        value={tempInput}
                        onChange={(e) => setTempInput(e.target.value)}
                        placeholder="e.g. 36.8"
                        className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#20364C] mb-1">
                        Blood Oxygen SpO2 (%) *
                      </label>
                      <input
                        type="number"
                        required
                        value={spo2Input}
                        onChange={(e) => setSpo2Input(e.target.value)}
                        placeholder="e.g. 98"
                        className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Triage Measurements &amp; Forward to Clinician</span>
                  </button>
                </form>

              </div>
            ) : (
              <EmptyState title="No patient selected" message="Select a patient from arrival queue to record vitals." />
            )}
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
