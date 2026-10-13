"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { apiFetch } from "@/lib/api";
import { 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Building2, 
  Stethoscope, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck 
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
    <AuthLayout
      badgeText="Verified Staff Workspace"
      badgeIcon={ShieldAlert}
      badgeVariant="blue"
      imageSrc="/images/nurse_care_coord.jpg"
      imageAlt="Sri Lankan Nurse in Ward Coordination"
      headline="Role-Enforced Clinical Workspaces & Administration."
      headlineDescription="Strict role-based access for verified doctors, nursing triage officers, pharmacists, lab scientists, and healthcare supervisors across Sri Lanka."
      featureCards={[
        {
          icon: Stethoscope,
          title: "Clinician & Nursing Station",
          desc: "Live outpatient queue handling, structured medical observations, and laboratory ordering.",
          iconColor: "text-teal-200",
        },
        {
          icon: Building2,
          title: "Facility & Regional Oversight",
          desc: "Inspection audits, staff credentialing approval, and nationwide hospital operations.",
          iconColor: "text-blue-200",
        },
      ]}
      title="Healthcare Staff Sign In"
      subtitle="Sign in with your SLMC/SLNC registration ID, employee number, or institutional work email."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-5">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/40 text-[#08786F] text-xs sm:text-sm flex items-center gap-3 shadow-2xs">
            <CheckCircle className="w-5 h-5 text-[#108B83] shrink-0" />
            <span>Authentication verified! Launching clinical workspace...</span>
          </div>
        )}

        {/* STEP 1: Employee Credentials Entry */}
        {authStep === "CREDENTIALS" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Employee ID, SLMC/SLNC Reg, or Work Email *
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. kasun.d@hospital.lk or SLMC-64821"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#698399]/50 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-[#243847]">
                  Security Password *
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-[#108B83] hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#698399] hover:text-[#243847]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{loading ? "Verifying Credentials..." : "Authenticate Staff Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Privileged MFA Verification */}
        {authStep === "MFA_CHALLENGE" && (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#DFEAF0] border border-[#467DA3]/30 text-xs text-[#243847] space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-[#467DA3]">
                <ShieldCheck className="w-4 h-4" />
                Secondary Multifactor Verification
              </span>
              <p className="text-[#667986]">
                Please enter the 6-digit authentication token issued to your registered staff security device.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                6-Digit Verification Code *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm tracking-widest text-center font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{loading ? "Verifying MFA Token..." : "Confirm & Enter Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setAuthStep("CREDENTIALS")}
              className="w-full text-center text-xs font-semibold text-[#667986] hover:text-[#243847] pt-1"
            >
              &larr; Return to Credentials Entry
            </button>
          </form>
        )}

        <div className="pt-6 border-t border-[#D5E0E3] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#667986]">
            <span>Are you a registered citizen patient?</span>
            <Link href="/auth/patient-login" className="font-bold text-[#108B83] hover:underline">
              Patient Portal Sign In &rarr;
            </Link>
          </div>
          <div className="flex items-center justify-between text-xs text-[#667986]">
            <span>New hospital staff or clinician?</span>
            <Link href="/auth/staff-register" className="font-bold text-[#467DA3] hover:underline">
              Submit Staff Registration &rarr;
            </Link>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
}
