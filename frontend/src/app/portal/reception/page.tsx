"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { 
  Building2, 
  Search, 
  UserCheck, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Users,
  Printer,
  RefreshCw,
  PlusCircle,
  FileText
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

const HOURLY_REGISTRATIONS = [
  { hour: "08:00", walkIn: 18, online: 12 },
  { hour: "09:00", walkIn: 29, online: 24 },
  { hour: "10:00", walkIn: 34, online: 20 },
  { hour: "11:00", walkIn: 22, online: 15 },
  { hour: "12:00", walkIn: 14, online: 9 },
];

export default function ReceptionDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Reception Desk Lead");
  const [facilityName, setFacilityName] = useState("National Hospital of Sri Lanka (NHSL)");

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
  const [searchTerm, setSearchTerm] = useState("");

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
      // Retain fallback records
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || (!user.roles?.includes("RECEPTIONIST") && !user.roles?.includes("SYSTEM_ADMIN") && !user.roles?.includes("HOSPITAL_ADMIN"))) {
        if (process.env.NODE_ENV === "production") {
          router.push("/auth/staff-login");
          return;
        }
      }
      if (user?.fullName) setUserName(user.fullName);
      if (user?.assignedFacilityId) setFacilityName(user.assignedFacilityId);
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

  const navItems = [
    { label: "Arrival Desk", href: "/portal/reception", icon: UserCheck, active: true },
    { label: "Clinic Coordinators", href: "/portal/coordinator", icon: Building2 },
    { label: "Nursing Station", href: "/portal/nurse", icon: Users },
  ];

  const filteredRecords = records.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalShell
      role="RECEPTIONIST"
      roleTitle="Reception & Check-in Desk"
      pageTitle="Patient Arrival & Digital Check-In"
      department="Main OPD Registration Desk"
      facility={facilityName}
      userName={userName}
      navItems={navItems}
      breadcrumbs={[
        { label: "Portal", href: "/portal/reception" },
        { label: "Reception Station" }
      ]}
      headerActions={
        <button
          onClick={fetchQueue}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F4F7] hover:bg-[#E8F0F4] border border-[#D9E3E9] text-xs font-bold text-[#087F79] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Manifest</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumStatCard
            label="Total Check-Ins"
            value="142 Patients"
            subValue="Today's registered arrivals"
            trend={{ value: "+8% vs yesterday", positive: true }}
            icon={Users}
            colorScheme="coral"
            badge="Live OPD"
          />
          <PremiumStatCard
            label="Serving Token"
            value="C-020"
            subValue="Cardiology Room 04"
            icon={Ticket}
            colorScheme="teal"
          />
          <PremiumStatCard
            label="Average Desk Wait"
            value="1.4 mins"
            subValue="Check-in issuance duration"
            icon={Clock}
            colorScheme="blue"
          />
          <PremiumStatCard
            label="Priority Badges"
            value="18 Issued"
            subValue="Senior citizens & acute urgency"
            icon={CheckCircle2}
            colorScheme="slate"
          />
        </div>

        {/* Check-In Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Assisted Walk-in Token Generator Form */}
          <div className="lg:col-span-5">
            <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-[#20364C] flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#087F79]" />
                  Issue Assisted Queue Ticket
                </h3>
                <p className="text-xs text-[#43566C] mt-0.5">
                  Generate digital token for walk-in citizens or verify existing reservations.
                </p>
              </div>

              {actionSuccess && (
                <div className="p-3.5 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#087F79] shrink-0" />
                  <span className="font-bold">{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <form onSubmit={handleGenerateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Citizen Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Kasun Chamara Perera"
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    NIC or Alternative ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    placeholder="e.g. 199512345678 or 951234567V"
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Destination Clinic &amp; Room *
                  </label>
                  <select
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  >
                    <option value="Cardiology Clinic Room 04">Cardiology Clinic Room 04</option>
                    <option value="General Outpatient OPD Room 01">General Outpatient OPD Room 01</option>
                    <option value="Diabetic & Endocrine Room 08">Diabetic &amp; Endocrine Room 08</option>
                    <option value="Orthopedic Clinic Room 05">Orthopedic Clinic Room 05</option>
                    <option value="Pediatrics Clinic Room 03">Pediatrics Clinic Room 03</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Triage Urgency Class
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  >
                    <option value="ROUTINE">Routine Outpatient</option>
                    <option value="SENIOR_CITIZEN">Senior Citizen / Differently Abled</option>
                    <option value="PRIORITY">Urgent Clinical Escalation</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{submitting ? "Transmitting..." : "Generate & Print Live Queue Ticket"}</span>
                </button>
              </form>

              {/* Newly Issued Ticket Card */}
              {issuedTicket && (
                <div className="p-4 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-xs text-[#20364C] space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>Token Generated</span>
                    <span className="text-base text-[#087F79]">{issuedTicket.token}</span>
                  </div>
                  <p className="text-[11px] text-[#43566C]">
                    Patient: {issuedTicket.patientName} &bull; Destination: {issuedTicket.clinic}
                  </p>
                </div>
              )}
            </div>

            {/* Registration Throughput Chart */}
            <div className="mt-6">
              <ChartCard title="Desk Registration Flow" subtitle="Hourly check-ins (walk-in vs online)" badge="Live">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={HOURLY_REGISTRATIONS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D9E3E9" />
                      <XAxis dataKey="hour" stroke="#43566C" fontSize={11} />
                      <YAxis stroke="#43566C" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#F8FAFB", borderColor: "#D9E3E9", borderRadius: "12px", color: "#20364C" }} />
                      <Bar dataKey="walkIn" fill="#087F79" radius={[6, 6, 0, 0]} name="Walk-In" />
                      <Bar dataKey="online" fill="#426DA9" radius={[6, 6, 0, 0]} name="Online Booking" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* Right Column: Registered Arrival Queue Table */}
          <div className="lg:col-span-7">
            <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E3E9] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#20364C]">Patient Arrival Manifest</h3>
                  <p className="text-xs text-[#43566C]">Today's registered queue tickets</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#43566C]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter by name or token..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] focus:outline-none focus:ring-1 focus:ring-[#159B94]"
                  />
                </div>
              </div>

              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#D9E3E9] text-[#43566C] font-semibold">
                        <th className="py-2.5 px-3">Token</th>
                        <th className="py-2.5 px-3">Citizen</th>
                        <th className="py-2.5 px-3">Clinic</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E3E9]">
                      {filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F0F4F7] transition">
                          <td className="py-3 px-3 font-mono font-extrabold text-[#20364C]">{r.token}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#20364C]">{r.patientName}</div>
                            <div className="text-[10px] text-[#43566C]">{r.nic}</div>
                          </td>
                          <td className="py-3 px-3 text-[#364A5D]">{r.clinic}</td>
                          <td className="py-3 px-3">
                            <StatusIndicator status={r.status} />
                          </td>
                          <td className="py-3 px-3 text-[#43566C] font-mono">{r.checkInTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No records match" message="No check-in entries found for the current query." />
              )}
            </div>
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
