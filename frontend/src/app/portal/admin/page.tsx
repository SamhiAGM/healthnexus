"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
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
  BarChart3,
  Settings
} from "lucide-react";

interface StaffApprovalRequest {
  id: string;
  fullName: string;
  requestedRole: "DOCTOR" | "NURSE" | "PHARMACIST" | "LAB_STAFF";
  regNumber: string;
  department: string;
  email: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
}

export default function AdminDashboard() {
  const router = useRouter();

  const [staffRequests, setStaffRequests] = useState<StaffApprovalRequest[]>([
    {
      id: "REQ-101",
      fullName: "Dr. Priyantha Dissanayake",
      requestedRole: "DOCTOR",
      regNumber: "SLMC-78901",
      department: "Cardiology",
      email: "priyantha.d@hospital.lk",
      status: "PENDING_APPROVAL",
    },
    {
      id: "REQ-102",
      fullName: "Nurse K. L. Menike",
      requestedRole: "NURSE",
      regNumber: "SLNC-45210",
      department: "Pediatrics OPD",
      email: "menike.kl@hospital.lk",
      status: "PENDING_APPROVAL",
    },
  ]);

  const [clinicCapacity, setClinicCapacity] = useState([
    { clinic: "Cardiology Outpatient Clinic", allocatedDoctors: 4, dailyLimit: 120, booked: 98 },
    { clinic: "General OPD Triage Desk", allocatedDoctors: 6, dailyLimit: 250, booked: 215 },
    { clinic: "Diabetic Care Center", allocatedDoctors: 3, dailyLimit: 90, booked: 74 },
    { clinic: "Orthopedic Surgical Clinic", allocatedDoctors: 2, dailyLimit: 60, booked: 52 },
  ]);

  const handleApprove = (id: string) => {
    setStaffRequests(staffRequests.map((req) => {
      if (req.id === id) {
        return { ...req, status: "APPROVED" as const };
      }
      return req;
    }));
  };

  const handleReject = (id: string) => {
    setStaffRequests(staffRequests.map((req) => {
      if (req.id === id) {
        return { ...req, status: "REJECTED" as const };
      }
      return req;
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("hc_staff_user");
    router.push("/auth/staff-login");
  };

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
            <div className="text-3xl font-extrabold text-amber-400 mt-1">
              {staffRequests.filter((s) => s.status === "PENDING_APPROVAL").length}
            </div>
            <span className="text-xs text-amber-400 mt-2 block">Action Required</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-700/60 shadow-lg">
            <span className="text-xs text-slate-400 font-semibold uppercase">Quality Audit Status</span>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">94% Score</div>
            <span className="text-xs text-teal-400 mt-2 block">Ministry Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Staff Onboarding Approvals */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Staff Access & Professional Registration Approvals
              </h3>
              <p className="text-xs text-slate-400">
                Grant or revoke clinical system privileges based on official medical registration verification.
              </p>
            </div>

            <div className="space-y-3">
              {staffRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-xl bg-[#0F1E36] border border-slate-700/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{req.fullName}</div>
                      <div className="text-xs text-teal-400">
                        {req.requestedRole} • {req.department}
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

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Reg Number: <strong className="text-slate-200">{req.regNumber}</strong></span>
                    <span>Contact: <strong className="text-slate-200">{req.email}</strong></span>
                  </div>

                  {req.status === "PENDING_APPROVAL" && (
                    <div className="flex items-center justify-end gap-2 pt-2">
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
              ))}
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
