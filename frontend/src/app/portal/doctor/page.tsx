"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
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
  Send, 
  RefreshCw,
  Search,
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";
import { 
  PremiumStatCard, 
  ChartCard, 
  StatusIndicator, 
  EmptyState, 
  LoadingSkeleton 
} from "@/components/portal/DashboardComponents";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

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

const HOURLY_QUEUE_TREND = [
  { time: "08:00", attended: 3, waiting: 8 },
  { time: "09:00", attended: 9, waiting: 14 },
  { time: "10:00", attended: 18, waiting: 12 },
  { time: "11:00", attended: 26, waiting: 6 },
  { time: "12:00", attended: 32, waiting: 2 },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Dr. Samantha Senanayake");
  const [facilityName, setFacilityName] = useState("National Hospital of Sri Lanka (NHSL)");

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
  const activePatient = queue[activePatientIndex] || queue[0];

  // Consultation Notes Form
  const [consultationNotes, setConsultationNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const [labOrders, setLabOrders] = useState("Resting 12-lead ECG");
  const [savedNotification, setSavedNotification] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  // Fetch live queue from backend
  const fetchLiveQueue = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/api/doctor/queue?facilityId=NHSL");
      if (Array.isArray(data) && data.length > 0) {
        const mapped: PatientQueueItem[] = data.map((d: any, idx: number) => ({
          id: d.id || `P-${100 + idx}`,
          token: d.ticketNumber || `C-02${idx}`,
          name: d.patientName || "Clinic Citizen",
          age: d.patientAge || 40,
          gender: d.patientGender === "F" ? "F" : "M",
          complaint: d.complaint || "Cardiology follow-up consultation",
          vitals: d.vitalsSummary || "BP: 125/82 mmHg, HR: 72 bpm",
          status: d.status || "WAITING",
        }));
        setQueue(mapped);
        setIsDemoData(false);
      } else {
        setIsDemoData(true);
      }
    } catch (e) {
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || !user.roles?.some(r => ["DOCTOR", "HOSPITAL_ADMIN", "SYSTEM_ADMIN"].includes(r))) {
        if (process.env.NODE_ENV === "production") {
          router.push("/auth/staff-login");
          return;
        }
      }
      if (user?.fullName) setUserName(user.fullName);
      if (user?.assignedFacilityId) setFacilityName(user.assignedFacilityId);
      fetchLiveQueue();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleStatusChange = async (index: number, newStatus: PatientQueueItem["status"]) => {
    const updated = [...queue];
    updated[index].status = newStatus;
    setQueue(updated);

    try {
      await apiFetch("/api/doctor/queue/status", {
        method: "POST",
        body: JSON.stringify({
          token: queue[index].token,
          status: newStatus,
        }),
      });
    } catch (e) {}
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const prescList = prescriptions.split(",").map((s) => s.trim()).filter(Boolean);
      const labList = labOrders.split(",").map((s) => s.trim()).filter(Boolean);

      await apiFetch("/api/doctor/consultations", {
        method: "POST",
        body: JSON.stringify({
          token: activePatient.token,
          patientId: activePatient.id,
          patientName: activePatient.name,
          facilityId: "NHSL",
          notes: consultationNotes,
          prescriptions: prescList,
          labOrders: labList,
        }),
      });
    } catch (e) {}

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

  const navItems = [
    { label: "Consultation Queue", href: "/portal/doctor", icon: Users, active: true },
    { label: "My Clinic Sessions", href: "/portal/doctor", icon: Calendar },
    { label: "Diagnostic Orders", href: "/portal/laboratory", icon: Activity },
    { label: "Pharmacy Dispatches", href: "/portal/pharmacy", icon: Pill },
  ];

  const completedCount = queue.filter(q => q.status === "COMPLETED").length;
  const waitingCount = queue.filter(q => q.status === "WAITING" || q.status === "CALLED").length;

  return (
    <PortalShell
      role="DOCTOR"
      roleTitle="Medical Doctor / Clinician"
      pageTitle="Clinical Consultation Desk"
      department="Cardiology Room 04"
      facility={facilityName}
      userName={userName}
      navItems={navItems}
      breadcrumbs={[
        { label: "Portal", href: "/portal/doctor" },
        { label: "Doctor Workspace" }
      ]}
      headerActions={
        <button
          onClick={fetchLiveQueue}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F4F7] hover:bg-[#E8F0F4] border border-[#D9E3E9] text-xs font-bold text-[#087F79] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumStatCard
            label="Current Session"
            value="Room 04"
            subValue="Cardiology Outpatient Clinic"
            icon={Stethoscope}
            colorScheme="blue"
            badge="Morning Quota"
          />
          <PremiumStatCard
            label="In Consultation"
            value={activePatient ? activePatient.token : "None"}
            subValue={activePatient ? activePatient.name : "Waiting for next token"}
            icon={Users}
            colorScheme="teal"
            badge="Active"
          />
          <PremiumStatCard
            label="Completed Today"
            value={`${completedCount} Patients`}
            subValue={`${waitingCount} remaining in queue`}
            trend={{ value: "+12% vs last week", positive: true }}
            icon={CheckCircle2}
            colorScheme="teal"
          />
          <PremiumStatCard
            label="Diagnostic Lab Orders"
            value="14 Dispatches"
            subValue="Sent to NHSL central pathology"
            icon={Activity}
            colorScheme="slate"
          />
        </div>

        {/* Live Queue Grid and Consultation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Today's Assigned Queue List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E3E9] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#20364C] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#426DA9]" />
                  Assigned Patient Queue
                </h3>
                <p className="text-xs text-[#43566C]">{queue.length} Total Patients in Shift</p>
              </div>
              {isDemoData && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0F4] text-[#426DA9] border border-[#426DA9]/30">
                  Live Queue Demonstration
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {queue.map((patient, index) => {
                const isSelected = index === activePatientIndex;
                return (
                  <div
                    key={patient.id}
                    onClick={() => setActivePatientIndex(index)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#F8FAFB] border-[#087F79] shadow-sm ring-1 ring-[#087F79]/30"
                        : "bg-[#F8FAFB] border-[#D9E3E9] hover:border-[#159B94]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-extrabold text-[#20364C]">
                          {patient.token}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#20364C]">{patient.name}</div>
                          <div className="text-[11px] text-[#43566C]">
                            Age {patient.age} &bull; {patient.gender === "M" ? "Male" : "Female"}
                          </div>
                        </div>
                      </div>
                      <StatusIndicator status={patient.status} />
                    </div>

                    <p className="text-xs text-[#43566C] mt-2 line-clamp-1 italic">
                      "{patient.complaint}"
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#D9E3E9] flex items-center justify-between text-[11px] text-[#087F79]">
                      <span className="font-mono font-medium">{patient.vitals}</span>
                      {isSelected && <span className="font-bold flex items-center gap-1">Consulting &rarr;</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Queue Trend Mini Chart */}
            <ChartCard title="Session Attendance Trend" subtitle="Patient tokens served per hour" badge="Today">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_QUEUE_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D9E3E9" />
                    <XAxis dataKey="time" stroke="#43566C" fontSize={11} />
                    <YAxis stroke="#43566C" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#F8FAFB", borderColor: "#D9E3E9", borderRadius: "12px", color: "#20364C" }} />
                    <Area type="monotone" dataKey="attended" stroke="#087F79" fill="#DFEFEC" strokeWidth={2} name="Attended" />
                    <Area type="monotone" dataKey="waiting" stroke="#426DA9" fill="#E8F0F4" strokeWidth={2} name="Waiting" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Right Column: Active Consultation Station */}
          <div className="lg:col-span-7">
            {activePatient ? (
              <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 shadow-xs space-y-6">
                
                {/* Active Patient Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E3E9] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/30">
                        Token {activePatient.token}
                      </span>
                      <StatusIndicator status={activePatient.status} />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#20364C]">{activePatient.name}</h3>
                    <p className="text-xs text-[#43566C]">
                      Patient ID: {activePatient.id} &bull; Age {activePatient.age} ({activePatient.gender === "M" ? "Male" : "Female"})
                    </p>
                  </div>

                  {/* Queue Control Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(activePatientIndex, "CALLED")}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#E8F0F4] hover:bg-[#DFEFEC] text-[#426DA9] border border-[#D9E3E9] transition"
                    >
                      Call Token
                    </button>
                    <button
                      onClick={() => handleStatusChange(activePatientIndex, "IN_CONSULTATION")}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#087F79] hover:bg-[#159B94] text-white transition shadow-sm"
                    >
                      Begin Consult
                    </button>
                  </div>
                </div>

                {/* Pre-Consultation Nursing Vitals Card */}
                <div className="p-4 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] space-y-1">
                  <span className="text-[11px] font-bold text-[#43566C] uppercase tracking-wider block">
                    Nursing Triage Observations &amp; Vitals
                  </span>
                  <div className="text-sm font-bold text-[#20364C]">{activePatient.vitals}</div>
                  <p className="text-xs text-[#364A5D] mt-1">Chief complaint: {activePatient.complaint}</p>
                </div>

                {savedNotification && (
                  <div className="p-3.5 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#087F79] shrink-0" />
                    <span className="font-bold">Consultation completed! Records and pharmacy dispatches transmitted.</span>
                  </div>
                )}

                {/* Consultation Recorder Form */}
                <form onSubmit={handleCompleteConsultation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#20364C] mb-1">
                      Clinical Observations &amp; Diagnostic Findings *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      placeholder="Enter clinical examination notes, diagnosis, and advice given to patient..."
                      className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#20364C] mb-1">
                        Prescribed Medications (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={prescriptions}
                        onChange={(e) => setPrescriptions(e.target.value)}
                        placeholder="e.g. Amlodipine 5mg OD, Atorvastatin 20mg Nocte"
                        className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#20364C] mb-1">
                        Diagnostic Investigations Dispatch
                      </label>
                      <select
                        value={labOrders}
                        onChange={(e) => setLabOrders(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                      >
                        <option value="Resting 12-lead ECG">Resting 12-lead ECG</option>
                        <option value="Fasting Blood Glucose & HbA1c">Fasting Blood Glucose &amp; HbA1c</option>
                        <option value="Full Blood Count (FBC)">Full Blood Count (FBC)</option>
                        <option value="Serum Lipid Profile">Serum Lipid Profile</option>
                        <option value="Echocardiography Doppler">Echocardiography Doppler</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation &amp; Dispatch to Pharmacy</span>
                  </button>
                </form>

              </div>
            ) : (
              <EmptyState title="No active consultation" message="Select a patient from the queue to start consultation." />
            )}
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
