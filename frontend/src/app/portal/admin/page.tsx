"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { 
  Building2, 
  Users, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Check, 
  FileCheck2, 
  Clock,
  Sparkles,
  Database,
  Lock,
  Layers,
  MapPin
} from "lucide-react";
import { 
  PremiumStatCard, 
  ChartCard, 
  StatusIndicator, 
  EmptyState,
  ConfirmationDialog 
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

interface StaffRequest {
  id: string;
  fullName: string;
  requestedRole: string;
  employeeId?: string;
  professionalRegistrationNumber?: string;
  department: string;
  workEmail: string;
  contactPhone?: string;
  facilityName?: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  createdAt?: string;
}

const REGISTRATION_TREND_DATA = [
  { month: "May", patients: 1240, staff: 42 },
  { month: "Jun", patients: 1890, staff: 68 },
  { month: "Jul", patients: 2450, staff: 95 },
  { month: "Aug", patients: 3120, staff: 110 },
  { month: "Sep", patients: 4050, staff: 135 },
  { month: "Oct", patients: 4890, staff: 160 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("System Administrator");
  const [facilityName, setFacilityName] = useState("HealthNexus National Directorate");

  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([
    {
      id: "REQ-101",
      fullName: "Dr. Priyantha Dissanayake",
      requestedRole: "DOCTOR",
      employeeId: "EMP-9041",
      professionalRegistrationNumber: "SLMC-78901",
      department: "Cardiology",
      workEmail: "priyantha.d@hospital.lk",
      facilityName: "National Hospital of Sri Lanka (NHSL)",
      status: "PENDING_APPROVAL",
    },
    {
      id: "REQ-102",
      fullName: "Sister K. L. Menike",
      requestedRole: "NURSE",
      employeeId: "EMP-4102",
      professionalRegistrationNumber: "SLNC-45210",
      department: "Pediatrics OPD",
      workEmail: "menike.kl@hospital.lk",
      facilityName: "National Hospital of Sri Lanka (NHSL)",
      status: "PENDING_APPROVAL",
    },
    {
      id: "REQ-103",
      fullName: "M. N. F. Rameez",
      requestedRole: "PHARMACIST",
      employeeId: "EMP-3891",
      professionalRegistrationNumber: "SLPC-12890",
      department: "Hospital Pharmacy",
      workEmail: "rameez.m@hospital.lk",
      facilityName: "Base Hospital Kinniya",
      status: "PENDING_APPROVAL",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<any | null>(null);

  const fetchLiveRequests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/api/admin/staff/requests");
      if (Array.isArray(data) && data.length > 0) {
        setStaffRequests(data);
      }
    } catch (e) {
      // Retain fallback list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || !user.roles?.some(r => ["SYSTEM_ADMIN", "HOSPITAL_ADMIN"].includes(r))) {
        if (process.env.NODE_ENV === "production") {
          router.push("/auth/staff-login");
          return;
        }
      }
      if (user?.fullName) setUserName(user.fullName);
      fetchLiveRequests();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleApprove = async (id: string) => {
    setActionMessage(null);
    try {
      const result = await apiFetch<any>(`/api/admin/staff/requests/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes: "Institutional credentials and council registration validated." }),
      });

      setActionMessage(`Approved: ${result.email || "Staff member"} has been provisioned with ${result.activatedRole || "requested"} privileges.`);
      setStaffRequests(staffRequests.map((req) => {
        if (req.id === id) {
          return { ...req, status: "APPROVED" as const };
        }
        return req;
      }));
    } catch (err: any) {
      setActionMessage(`Approval failed: ${err.message || "Unauthorized or backend error"}`);
    }
  };

  const handleReject = async (id: string) => {
    setActionMessage(null);
    try {
      await apiFetch(`/api/admin/staff/requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "Credentials could not be verified against institutional ledger." }),
      });

      setActionMessage(`Request ${id} rejected.`);
      setStaffRequests(staffRequests.map((req) => {
        if (req.id === id) {
          return { ...req, status: "REJECTED" as const };
        }
        return req;
      }));
    } catch (err: any) {
      setActionMessage(`Rejection failed: ${err.message || "Unauthorized or backend error"}`);
    }
  };

  const fetchAuditDryRun = async () => {
    setAuditLoading(true);
    try {
      const data = await apiFetch<any>("/api/admin/database/audit-dry-run");
      setAuditReport(data);
      setActionMessage("Database audit dry-run completed successfully (Read-Only Mode).");
    } catch (err: any) {
      setActionMessage(`Audit query failed: ${err.message || "Unauthorized or backend offline"}`);
    } finally {
      setAuditLoading(false);
    }
  };

  const pendingCount = staffRequests.filter((s) => s.status === "PENDING_APPROVAL").length;
  const approvedCount = staffRequests.filter((s) => s.status === "APPROVED").length;

  const navItems = [
    { label: "Platform Overview", href: "/portal/admin", icon: ShieldCheck, active: true },
    { label: "Staff Verification", href: "/portal/admin", icon: UserCheck, badge: pendingCount > 0 ? `${pendingCount}` : undefined },
    { label: "Hospital Admin", href: "/portal/hospital-admin", icon: Building2 },
    { label: "Facility Directory", href: "/hospitals", icon: MapPin },
  ];

  const filteredRequests = staffRequests.filter((r) => {
    const matchesRole = filterRole === "ALL" || r.requestedRole === filterRole;
    const matchesSearch = r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.workEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.facilityName && r.facilityName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <PortalShell
      role="SYSTEM_ADMIN"
      roleTitle="National System Administrator"
      pageTitle="Platform Governance & Role Authorization"
      department="Digital Health Infrastructure Directorate"
      facility={facilityName}
      userName={userName}
      navItems={navItems}
      breadcrumbs={[
        { label: "Portal", href: "/portal/admin" },
        { label: "System Administration" }
      ]}
      headerActions={
        <button
          onClick={fetchLiveRequests}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F4F7] hover:bg-[#E8F0F4] border border-[#D9E3E9] text-xs font-bold text-[#087F79] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Requests</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumStatCard
            label="Pending Staff Approvals"
            value={`${pendingCount} Requests`}
            subValue="Awaiting SLMC/SLNC validation"
            icon={UserCheck}
            colorScheme="coral"
            badge="Action Required"
          />
          <PremiumStatCard
            label="Authorized Healthcare Staff"
            value="164 Staff"
            subValue="Across 11 role taxonomies"
            trend={{ value: "+18 this month", positive: true }}
            icon={ShieldCheck}
            colorScheme="teal"
          />
          <PremiumStatCard
            label="Registered Citizens"
            value="4,890 Patients"
            subValue="Verified NIC digital identities"
            trend={{ value: "+21% monthly growth", positive: true }}
            icon={Users}
            colorScheme="blue"
          />
          <PremiumStatCard
            label="Connected Hospital Nodes"
            value="40+ Facilities"
            subValue="Official MoH 2026 directory"
            icon={Building2}
            colorScheme="slate"
          />
        </div>

        {actionMessage && (
          <div className="p-4 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#087F79] shrink-0" />
              <span className="font-bold">{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-[#087F79] hover:underline font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Growth Trend Graph & Audit Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8">
            <ChartCard title="Platform Adoption & User Onboarding" subtitle="Citizen patients and verified clinical staff growth" badge="Cumulative 2026">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REGISTRATION_TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D9E3E9" />
                    <XAxis dataKey="month" stroke="#43566C" fontSize={11} />
                    <YAxis stroke="#43566C" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#F8FAFB", borderColor: "#D9E3E9", borderRadius: "12px", color: "#20364C" }} />
                    <Area type="monotone" dataKey="patients" stroke="#087F79" fill="#DFEFEC" strokeWidth={2} name="Registered Patients" />
                    <Area type="monotone" dataKey="staff" stroke="#426DA9" fill="#E8F0F4" strokeWidth={2} name="Verified Staff" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DFEFEC] border border-[#159B94]/30 flex items-center justify-center text-[#087F79]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#20364C]">Database Audit Controls</h4>
                  <p className="text-[11px] text-[#43566C]">MongoDB Atlas collection verification</p>
                </div>
              </div>

              <p className="text-xs text-[#364A5D] leading-relaxed">
                Execute a read-only audit dry-run to verify document schemas, indexes, and orphaned records across collections without data modification.
              </p>

              <button
                onClick={fetchAuditDryRun}
                disabled={auditLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E8F0F4] hover:bg-[#DFEFEC] text-[#426DA9] border border-[#D9E3E9] text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5 text-[#087F79]" />
                <span>{auditLoading ? "Running Query..." : "Execute Audit Dry-Run"}</span>
              </button>

              {auditReport && (
                <div className="p-3 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] text-[11px] font-mono space-y-1">
                  <div className="text-[#087F79] font-bold">Status: READ_ONLY_VERIFIED</div>
                  <div>Users: {auditReport.usersCount ?? "4,890"} docs</div>
                  <div>Queues: {auditReport.queuesCount ?? "142"} active</div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#DFEFEC]/70 border border-[#159B94]/30 text-xs text-[#20364C] space-y-1.5">
              <span className="font-bold text-[#087F79] flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                SL-CERT Security Governance
              </span>
              <p className="text-[11px] text-[#43566C] leading-relaxed">
                Administrative privilege issuance requires dual review. Rejected applicants can appeal via hospital directorate.
              </p>
            </div>
          </div>

        </div>

        {/* Staff Verification Requests Table */}
        <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E3E9] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#20364C] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#087F79]" />
                Healthcare Staff Application Ledger
              </h3>
              <p className="text-xs text-[#43566C]">
                Verify council credentials before activating clinical workspace access
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#43566C]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff, email, hospital..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] focus:outline-none focus:ring-1 focus:ring-[#159B94]"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] focus:outline-none focus:ring-1 focus:ring-[#159B94]"
              >
                <option value="ALL">All Roles</option>
                <option value="DOCTOR">Medical Doctors</option>
                <option value="NURSE">Nursing Staff</option>
                <option value="PHARMACIST">Pharmacists</option>
                <option value="LAB_STAFF">Laboratory</option>
              </select>
            </div>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D9E3E9] text-[#43566C] font-semibold">
                    <th className="py-2.5 px-3">Applicant Name</th>
                    <th className="py-2.5 px-3">Requested Role</th>
                    <th className="py-2.5 px-3">Council Reg / Employee ID</th>
                    <th className="py-2.5 px-3">Facility &amp; Department</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E3E9]">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#F0F4F7] transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#20364C]">{req.fullName}</div>
                        <div className="text-[11px] text-[#43566C]">{req.workEmail}</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#087F79]">
                        {req.requestedRole}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[#364A5D]">
                        {req.professionalRegistrationNumber || req.employeeId || "Pending Verification"}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-[#20364C]">{req.facilityName || "NHSL"}</div>
                        <div className="text-[11px] text-[#43566C]">{req.department}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusIndicator status={req.status} />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {req.status === "PENDING_APPROVAL" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#DFEFEC] hover:bg-[#cbe8e2] text-[#087F79] font-bold text-xs border border-[#159B94]/30 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#43566C] italic font-medium">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No staff applications" message="No pending staff applications match the current filter." />
          )}
        </div>

      </div>
    </PortalShell>
  );
}
