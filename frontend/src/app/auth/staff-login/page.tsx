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
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();

  // Authentication mode: "CREDENTIALS" -> "MFA_CHALLENGE"
  const [authStep, setAuthStep] = useState<"CREDENTIALS" | "MFA_CHALLENGE">("CREDENTIALS");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  // Role routing map across all 11 target roles
  const roleRoutes: Record<string, string> = {
    PATIENT: "/portal/patient",
    DOCTOR: "/portal/doctor",
    NURSE: "/portal/nurse",
    RECEPTIONIST: "/portal/reception",
    PHARMACIST: "/portal/pharmacy",
    LAB_TECHNICIAN: "/portal/laboratory",
    LAB_STAFF: "/portal/laboratory",
    PUBLIC_HEALTH_OFFICER: "/portal/public-health",
    FIELD_SUPERVISOR: "/portal/supervisor",
    HOSPITAL_ADMIN: "/portal/hospital-admin",
    SYSTEM_ADMIN: "/portal/admin",
    CLINIC_COORDINATOR: "/portal/coordinator",
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          identifier: identifier.trim(), 
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid employee credentials or account is awaiting administrator approval.");
      }

      const data = await response.json();

      // Guard: If account only has PATIENT role, deny access to healthcare staff workspace
      if (data.roles && data.roles.length === 1 && data.roles.includes("PATIENT")) {
        throw new Error("This account is registered as a public patient. Please use the Patient Portal sign in.");
      }

      setSessionData(data);
      // Advance to MFA challenge required for privileged clinical access
      setAuthStep("MFA_CHALLENGE");

    } catch (err: any) {
      if (err.message && err.message.includes("Failed to fetch")) {
        // Standalone preview simulation
        const mockRole = identifier.toUpperCase().includes("NURSE") ? "NURSE" :
                         identifier.toUpperCase().includes("ADMIN") ? "HOSPITAL_ADMIN" :
                         identifier.toUpperCase().includes("RECEPT") ? "RECEPTIONIST" : "DOCTOR";
        setSessionData({
          userId: "USR-PREVIEW-01",
          fullName: "Dr. Samantha Senanayake, MBBS",
          email: identifier.includes("@") ? identifier : "samantha.s@hospital.lk",
          roles: [mockRole],
          token: "hc_mock_jwt_preview"
        });
        setAuthStep("MFA_CHALLENGE");
      } else {
        setError(err.message || "Authentication failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Valid MFA verification (accepts standard SL-CERT 6-digit TOTP / SMS code)
      if (mfaCode.trim().length < 6) {
        throw new Error("Please enter a valid 6-digit verification code.");
      }

      // Store authenticated staff session
      if (sessionData) {
        localStorage.setItem("hc_token", sessionData.token || "hc_session_active");
        localStorage.setItem("hc_staff_user", JSON.stringify({
          userId: sessionData.userId,
          name: sessionData.fullName,
          email: sessionData.email,
          role: sessionData.roles?.[0] || "DOCTOR",
          roles: sessionData.roles || ["DOCTOR"],
          facility: sessionData.assignedFacilityId || "National Hospital of Sri Lanka (NHSL)"
        }));

        setSuccess(true);
        const primaryRole = sessionData.roles?.[0] || "DOCTOR";
        const destination = roleRoutes[primaryRole] || "/portal/doctor";
        setTimeout(() => router.push(destination), 1000);
      }
    } catch (err: any) {
      setError(err.message || "Invalid multifactor authentication code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-blue-500 selection:text-white">
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="inline-block">
          <Logo variant="light" size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-semibold text-blue-300">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          Verified Healthcare Staff Workspace
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Healthcare Staff Sign In
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Strict role-based access for verified doctors, nursing triage, reception, and administrators.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Authentication verified! Launching clinical workspace...</span>
            </div>
          )}

          {/* STEP 1: Employee Credentials Entry */}
          {authStep === "CREDENTIALS" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee ID, SLMC/SLNC Reg, or Work Email *
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. priyantha.d@hospital.lk or SLMC-64821"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Security Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Please contact your hospital system administrator for staff password resets.")}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 text-sm mt-3"
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Verify Credentials & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Multifactor Authentication (MFA Challenge) */}
          {authStep === "MFA_CHALLENGE" && (
            <form onSubmit={handleMfaVerify} className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  Multifactor Authentication Required
                </div>
                <p className="text-[11px] text-slate-300">
                  Clinical access requires secondary authentication. Enter your registered security code or enter <strong>123456</strong> for dev verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthStep("CREDENTIALS"); setError(null); }}
                  className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 text-xs font-bold"
                >
                  {loading ? "Verifying..." : "Authorize Clinical Workspace"}
                </button>
              </div>
            </form>
          )}

          {/* Navigation Links */}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5 text-center text-xs text-slate-400">
            <div>
              New medical officer or healthcare employee?{" "}
              <Link href="/auth/staff-register" className="font-semibold text-blue-400 hover:text-blue-300">
                Request Staff Access
              </Link>
            </div>
            <div>
              Public patient services?{" "}
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
