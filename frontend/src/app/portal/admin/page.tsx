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

  return (
    <div className="min-h-screen bg-[#081225] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <header className="bg-[#0B1730] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="light" size="sm" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Hospital Administration
              </span>
              <span className="hidden md:inline-block text-xs text-slate-400">
                National Hospital of Sri Lanka (NHSL) Executive Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">Director Dr. Anura Senanayake</div>
              <div className="text-[10px] text-teal-400">Hospital Admin Auth</div>
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <span className="text-xs text-slate-400 font-semibold uppercase">Daily Attendance</span>
            <div className="text-3xl font-extrabold text-white mt-1">439 Patients</div>
            <span className="text-xs text-emerald-400 mt-2 block">84% Capacity Utilized</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <span className="text-xs text-slate-400 font-semibold uppercase">On-Duty Medical Staff</span>
            <div className="text-3xl font-extrabold text-teal-400 mt-1">32 Clinicians</div>
            <span className="text-xs text-slate-400 mt-2 block">Across 6 Outpatient Wings</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Staff Verifications</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">{pendingCount}</div>
            <span className="text-xs text-amber-400 mt-2 block">Action Required</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <span className="text-xs text-slate-400 font-semibold uppercase">Quality Audit Status</span>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">94% Score</div>
            <span className="text-xs text-teal-400 mt-2 block">Ministry Verified</span>
          </div>
        </div>

        {/* Action Flash Banner */}
        {actionMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-200 text-xs sm:text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs text-emerald-400 hover:text-white"
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
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Staff Access & Professional Registration Approvals
                </h3>
                <p className="text-xs text-slate-400">
                  Grant or revoke clinical system privileges based on official medical registration verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
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
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Refresh Live Requests"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#0F1E36] border border-slate-800 text-center text-xs text-slate-400">
                  No staff access requests matching the current filter.
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl bg-[#0F1E36] border border-slate-700/70 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{req.fullName}</div>
                        <div className="text-xs text-teal-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold">{req.requestedRole}</span>
                          <span>•</span>
                          <span className="text-slate-300">{req.department}</span>
                          {req.employeeId && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{req.employeeId}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.status === "APPROVED"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          : req.status === "REJECTED"
                          ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                          : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                      }`}>
                        {req.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <div>
                        Council Reg:{" "}
                        <strong className="text-slate-200">
                          {req.professionalRegistrationNumber || "N/A"}
                        </strong>
                      </div>
                      <div>
                        Work Email: <strong className="text-slate-200">{req.workEmail}</strong>
                      </div>
                    </div>

                    {req.status === "PENDING_APPROVAL" && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold border border-rose-600/30 transition-colors flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
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

          {/* Right Column: Clinic Session Capacities */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                Clinic Session Quota Management
              </h3>
              <p className="text-xs text-slate-400">Real-time daily booking quotas per specialized wing</p>
            </div>

            <div className="space-y-3">
              {clinicCapacity.map((c, idx) => {
                const percentage = Math.round((c.booked / c.dailyLimit) * 100);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0F1E36] border border-slate-700/70 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">{c.clinic}</div>
                      <span className="text-[11px] font-semibold text-teal-400">
                        {c.booked} / {c.dailyLimit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{c.allocatedDoctors} Attending Consultants</span>
                      <span>{percentage}% Booked</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
