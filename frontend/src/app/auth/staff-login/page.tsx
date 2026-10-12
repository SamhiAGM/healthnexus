"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { apiFetch } from "@/lib/api";
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
  Clock,
  Sparkles,
  ArrowLeft
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
      const data = await apiFetch<any>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ 
          identifier: identifier.trim(), 
          password 
        }),
      });

      // Guard: If account only has PATIENT role, deny access to healthcare staff workspace
      if (data.roles && data.roles.length === 1 && data.roles.includes("PATIENT")) {
        throw new Error("This account is registered as a public patient. Please use the Patient Portal sign in.");
      }

      setSessionData(data);

      if (data.mfaRequired) {
        // Advance to MFA challenge required for privileged clinical access
        setAuthStep("MFA_CHALLENGE");
      } else {
        // Direct staff session (if MFA not required)
        if (typeof window !== "undefined") {
          localStorage.setItem("hc_staff_user", JSON.stringify({
            userId: data.userId,
            name: data.fullName,
            email: data.email,
            role: data.roles?.[0] || "DOCTOR",
            roles: data.roles || ["DOCTOR"],
            facility: data.assignedFacilityId || "Healthcare Facility"
          }));
        }
        setSuccess(true);
        const primaryRole = data.roles?.[0] || "DOCTOR";
        const destination = roleRoutes[primaryRole] || "/portal/doctor";
        setTimeout(() => router.push(destination), 1000);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!mfaCode.trim() || mfaCode.trim().length < 6) {
        throw new Error("Please enter a valid 6-digit verification code.");
      }

      const verifiedData = await apiFetch<any>("/api/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({
          mfaSessionId: sessionData?.mfaSessionId,
          code: mfaCode.trim(),
        }),
      });

      // Store non-sensitive authenticated staff metadata
      if (typeof window !== "undefined") {
        localStorage.setItem("hc_staff_user", JSON.stringify({
          userId: verifiedData.userId,
          name: verifiedData.fullName,
          email: verifiedData.email,
          role: verifiedData.roles?.[0] || "DOCTOR",
          roles: verifiedData.roles || ["DOCTOR"],
          facility: verifiedData.assignedFacilityId || "Healthcare Facility"
        }));
      }

      setSuccess(true);
      const primaryRole = verifiedData.roles?.[0] || "DOCTOR";
      const destination = roleRoutes[primaryRole] || "/portal/doctor";
      setTimeout(() => router.push(destination), 1000);
    } catch (err: any) {
      setError(err.message || "Multifactor authentication failed. Privileged access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F7] text-[#364A5D] flex flex-col lg:flex-row selection:bg-[#426DA9] selection:text-white">
      
      {/* LEFT COLUMN: Visual & Role Assurance Branding */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#20364C] via-[#2D4A66] to-[#426DA9] text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#159B94]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#DFEFEC] text-xs font-semibold backdrop-blur-md">
            <ShieldAlert className="w-3.5 h-3.5 text-[#63E2D8]" />
            Verified Healthcare Staff Workspace
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Role-Enforced Clinical Workspaces &amp; Administration.
          </h1>
          <p className="text-sm xl:text-base text-[#E8F0F4]/90 leading-relaxed">
            Strict role-based access for verified doctors, nursing triage officers, pharmacists, lab scientists, and healthcare supervisors across Sri Lanka.
          </p>

          <div className="grid grid-cols-1 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <Stethoscope className="w-5 h-5 text-teal-200 mb-2" />
              <div className="text-sm font-bold text-white">Clinician &amp; Nursing Station</div>
              <div className="text-xs text-[#E8F0F4]/80 mt-1">Live outpatient queue handling, structured medical observations, and laboratory ordering.</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <Building2 className="w-5 h-5 text-blue-200 mb-2" />
              <div className="text-sm font-bold text-white">Facility &amp; Regional Supervision</div>
              <div className="text-xs text-[#E8F0F4]/80 mt-1">Institutional inspection audits, staff authorization, and nationwide hospital oversight.</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-[#E8F0F4]/80">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-200" />
            Privileged Staff Session
          </span>
          <Link href="/auth/staff-register" className="text-[#63E2D8] hover:text-white font-semibold">
            Apply for Staff Access &rarr;
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Form (Balanced Palette) */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          <div className="lg:hidden flex justify-between items-center pb-3 border-b border-[#D9E3E9]">
            <Logo variant="dark" size="sm" />
            <Link href="/" className="text-xs font-bold text-[#087F79] hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFEFEC] border border-[#159B94]/30 text-xs font-bold text-[#087F79] mb-3">
              <KeyRound className="w-3.5 h-3.5 text-[#087F79]" />
              Staff Security Gate
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20364C] tracking-tight">
              Healthcare Staff Sign In
            </h2>
            <p className="text-xs sm:text-sm text-[#43566C] mt-1">
              Sign in with your SLMC/SLNC registration ID, employee number, or institutional work email.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs sm:text-sm flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-[#087F79] shrink-0" />
              <span>Authentication verified! Launching clinical workspace...</span>
            </div>
          )}

          {/* STEP 1: Employee Credentials Entry */}
          {authStep === "CREDENTIALS" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  Employee ID, SLMC/SLNC Reg, or Work Email *
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43566C]" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. kasun.d@hospital.lk or SLMC-64821"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFB] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] placeholder:text-[#43566C]/50 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#20364C]">
                    Security Password *
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] text-[#087F79] hover:underline font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43566C]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFB] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43566C] hover:text-[#20364C]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <span>{loading ? "Verifying Credentials..." : "Authenticate Staff Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Privileged MFA Verification */}
          {authStep === "MFA_CHALLENGE" && (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#E8F0F4] border border-[#D9E3E9] text-xs text-[#20364C] space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-[#087F79]">
                  <ShieldCheck className="w-4 h-4" />
                  Secondary Multifactor Verification
                </span>
                <p className="text-[#43566C]">
                  Please enter the 6-digit authentication token issued to your registered staff security device.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  6-Digit Verification Code *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43566C]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFB] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm tracking-widest text-center font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <span>{loading ? "Verifying MFA Token..." : "Confirm & Enter Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setAuthStep("CREDENTIALS")}
                className="w-full text-center text-xs font-semibold text-[#43566C] hover:text-[#20364C]"
              >
                &larr; Return to Credentials Entry
              </button>
            </form>
          )}

          <div className="pt-6 border-t border-[#D9E3E9] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#43566C]">
              <span>Are you a registered citizen patient?</span>
              <Link href="/auth/patient-login" className="font-bold text-[#087F79] hover:underline">
                Patient Portal Sign In &rarr;
              </Link>
            </div>
            <div className="flex items-center justify-between text-xs text-[#43566C]">
              <span>New hospital staff or clinician?</span>
              <Link href="/auth/staff-register" className="font-bold text-[#426DA9] hover:underline">
                Submit Staff Registration &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
