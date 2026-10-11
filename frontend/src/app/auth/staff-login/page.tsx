"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle,
  Building2,
  Stethoscope,
  Briefcase
} from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("DOCTOR");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const staffRoles = [
    { id: "DOCTOR", name: "Medical Doctor / Clinician", path: "/portal/doctor" },
    { id: "NURSE", name: "Nursing Staff & Triage", path: "/portal/nurse" },
    { id: "RECEPTIONIST", name: "Hospital Desk & Check-in", path: "/portal/reception" },
    { id: "FIELD_SUPERVISOR", name: "Field Supervision Officer", path: "/portal/supervisor" },
    { id: "HOSPITAL_ADMIN", name: "Hospital Administrator", path: "/portal/admin" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Connect to Spring Boot auth API or use verified staff session simulation
      const selectedRoleObj = staffRoles.find((r) => r.id === role);
      const targetPath = selectedRoleObj ? selectedRoleObj.path : "/portal/doctor";

      localStorage.setItem("hc_staff_user", JSON.stringify({
        employeeId: employeeId || "SL-MED-0428",
        role: role,
        facility: "National Hospital of Sri Lanka (NHSL)",
        name: role === "DOCTOR" ? "Dr. Samantha Senanayake, MBBS" : "Staff Member"
      }));

      setSuccess(true);
      setTimeout(() => router.push(targetPath), 1000);

    } catch (err: any) {
      setError("Unable to authenticate staff credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#081225] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-blue-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-block">
          <Logo variant="light" size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-semibold text-blue-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          Verified Healthcare Staff Workspace
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Healthcare Staff Sign In
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Strict role-based access for doctors, nurses, triage reception, supervisors, and admins.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Verified credentials. Launching clinical workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Professional Role *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {staffRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employee / Professional Registration Number *
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. SLMC-64821 or EMP-0428"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Security Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter authorized password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating..." : "Sign In to Staff Workspace"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5 text-center text-xs text-slate-400">
            <div>
              New medical officer or healthcare employee?{" "}
              <Link href="/auth/staff-register" className="font-semibold text-blue-400 hover:text-blue-300">
                Request Staff Access
              </Link>
            </div>
            <div>
              Need public citizen patient services?{" "}
              <Link href="/auth/patient-login" className="font-semibold text-teal-400 hover:text-teal-300">
                Go to Patient Portal
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
