"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { apiFetch, getCurrentUser, logoutUser } from "@/lib/api";
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
  LogOut,
  RefreshCw,
  Search,
  Check,
  FileCheck2,
  Clock
} from "lucide-react";

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

export default function AdminDashboard() {
  const router = useRouter();

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
      fullName: "Nurse K. L. Menike",
      requestedRole: "NURSE",
      employeeId: "EMP-4102",
      professionalRegistrationNumber: "SLNC-45210",
      department: "Pediatrics OPD",
      workEmail: "menike.kl@hospital.lk",
      facilityName: "National Hospital of Sri Lanka (NHSL)",
      status: "PENDING_APPROVAL",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("ALL");

  const [clinicCapacity, setClinicCapacity] = useState([
    { clinic: "Cardiology Outpatient Clinic", allocatedDoctors: 4, dailyLimit: 120, booked: 98 },
    { clinic: "General OPD Triage Desk", allocatedDoctors: 6, dailyLimit: 250, booked: 215 },
    { clinic: "Diabetic Care Center", allocatedDoctors: 3, dailyLimit: 90, booked: 74 },
    { clinic: "Orthopedic Surgical Clinic", allocatedDoctors: 2, dailyLimit: 60, booked: 52 },
  ]);

  // Fetch live requests from Spring Boot backend
  const fetchLiveRequests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/api/admin/staff/requests");
      if (Array.isArray(data) && data.length > 0) {
        setStaffRequests(data);
      }
    } catch (e) {
      // Retain fallback list on network interruption
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || !user.roles?.some(r => ["SYSTEM_ADMIN", "HOSPITAL_ADMIN"].includes(r))) {
        router.push("/auth/staff-login");
        return;
      }
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

      setActionMessage(`Approved: ${result.email || "Staff"} has been provisioned with ${result.activatedRole || "requested"} access.`);
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

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/staff-login");
  };

  const filteredRequests = filterRole === "ALL" 
    ? staffRequests 
    : staffRequests.filter((r) => r.requestedRole === filterRole);

  const pendingCount = staffRequests.filter((s) => s.status === "PENDING_APPROVAL").length;

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<any | null>(null);

  const fetchAuditDryRun = async () => {
    setAuditLoading(true);
    try {
      const data = await apiFetch<any>("/api/admin/database/audit-dry-run");
      setAuditReport(data);
      setActionMessage("Database audit dry-run completed successfully (Read-Only).");
    } catch (err: any) {
      setActionMessage(`Audit query failed: ${err.message || "Unauthorized or backend offline"}`);
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <header className="bg-white/95 border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="dark" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Hospital Administration
              </span>
              <span className="hidden md:inline-block text-xs text-slate-500">
                National Hospital of Sri Lanka (NHSL) Executive Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">Director Dr. Anura Senanayake</div>
              <div className="text-[10px] text-teal-600 font-medium">Hospital Admin Auth</div>
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Daily Attendance</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">439 Patients</div>
            <span className="text-xs text-emerald-700 mt-2 block font-medium">84% Capacity Utilized</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">On-Duty Medical Staff</span>
            <div className="text-3xl font-extrabold text-teal-700 mt-1">32 Clinicians</div>
            <span className="text-xs text-slate-500 mt-2 block">Across 6 Outpatient Wings</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Pending Staff Verifications</span>
            <div className="text-3xl font-extrabold text-amber-700 mt-1">{pendingCount}</div>
            <span className="text-xs text-amber-700 mt-2 block font-medium">Action Required</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Quality Audit Status</span>
            <div className="text-3xl font-extrabold text-blue-700 mt-1">94% Score</div>
            <span className="text-xs text-teal-700 mt-2 block font-medium">Ministry Verified</span>
          </div>
        </div>

        {/* Action Flash Banner */}
        {actionMessage && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Staff Onboarding Approvals */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Staff Access & Professional Registration Approvals
                </h3>
                <p className="text-xs text-slate-500">
                  Grant or revoke clinical system privileges based on official medical registration verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="DOCTOR">Doctors</option>
                  <option value="NURSE">Nurses</option>
                  <option value="PHARMACIST">Pharmacists</option>
                  <option value="LAB_STAFF">Lab Staff</option>
                </select>

                <button
                  onClick={fetchLiveRequests}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs transition-colors"
                  title="Refresh Live Requests"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-xs">
                  No staff access requests matching the current filter.
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{req.fullName}</div>
                        <div className="text-xs text-teal-700 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold">{req.requestedRole}</span>
                          <span>•</span>
                          <span className="text-slate-600">{req.department}</span>
                          {req.employeeId && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">{req.employeeId}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : req.status === "REJECTED"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {req.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        Council Reg:{" "}
                        <strong className="text-slate-800">
                          {req.professionalRegistrationNumber || "N/A"}
                        </strong>
                      </div>
                      <div>
                        Work Email: <strong className="text-slate-800">{req.workEmail}</strong>
                      </div>
                    </div>

                    {req.status === "PENDING_APPROVAL" && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Verify & Authorize
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Clinic Session Capacities & Database Audit */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Clinic Capacity */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Clinic Session Quota Management
                </h3>
                <p className="text-xs text-slate-500">Real-time daily booking quotas per specialized wing</p>
              </div>

              <div className="space-y-3">
                {clinicCapacity.map((c, idx) => {
                  const percentage = Math.round((c.booked / c.dailyLimit) * 100);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900">{c.clinic}</div>
                        <span className="text-[11px] font-semibold text-teal-700">
                          {c.booked} / {c.dailyLimit}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{c.allocatedDoctors} Attending Consultants</span>
                        <span>{percentage}% Booked</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Database Maintenance & Audit Section */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    MongoDB Integrity & Dry-Run Audit
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Safe read-only audit to distinguish synthetic accounts from real production records.
                  </p>
                </div>
                <button
                  onClick={fetchAuditDryRun}
                  disabled={auditLoading}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin" : ""}`} />
                  Run Audit
                </button>
              </div>

              {auditReport && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-700">
                    <span>Total User Records:</span>
                    <strong className="text-slate-900">{auditReport.totalUsersScanned}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Protected Production Records:</span>
                    <strong>{auditReport.protectedRealUsers}</strong>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Synthetic Demo Candidates:</span>
                    <strong>{auditReport.syntheticDemoAccountsCount}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
                    Status: <span className="text-teal-700 font-semibold">{auditReport.status}</span> (Protected by approval lock code)
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
