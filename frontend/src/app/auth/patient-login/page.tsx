"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { apiFetch, AuthResponse } from "@/lib/api";
import { 
  User, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  CalendarCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  MailCheck 
} from "lucide-react";

function PatientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isRegistered = searchParams.get("registered") === "1" || searchParams.get("registered") === "true";
  const isVerified = searchParams.get("verified") === "1" || searchParams.get("verified") === "true";
  const queryId = searchParams.get("id") || "";

  const [identifier, setIdentifier] = useState(queryId);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ 
          identifier: identifier.trim(), 
          password 
        }),
      });

      setSuccess(true);
      setTimeout(() => router.push("/portal/patient"), 1000);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your login details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Citizen & Patient Access"
      badgeIcon={User}
      badgeVariant="teal"
      imageSrc="/images/patient_digital_care.jpg"
      imageAlt="Sri Lankan Citizen Using Digital Healthcare in Waiting Lounge"
      headline="Check Your Queues & Manage Consultations."
      headlineDescription="Sign in to view live outpatient queue tokens, schedule specialist clinic visits, and receive automated appointment alerts across Sri Lanka."
      featureCards={[
        {
          icon: CalendarCheck,
          title: "Live Queue Synchronization",
          desc: "Real-time ticket updates for NHSL, provincial, and district base hospitals.",
          iconColor: "text-teal-200",
        },
        {
          icon: CheckCircle2,
          title: "Cryptographic Privacy",
          desc: "Sri Lankan NIC privacy protection with salted tokenization.",
          iconColor: "text-blue-200",
        },
      ]}
      title="Patient Portal Sign In"
      subtitle="Sign in with your Sri Lankan NIC, registered mobile number, or email."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-5">
        
        {/* Registration Success Banner */}
        {isRegistered && !isVerified && (
          <div className="p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30 text-[#08786F] text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <CheckCircle className="w-5 h-5 text-[#108B83] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Registration Successful!</span>
              <span className="text-[#3C5262]">Your citizen profile has been created. Please sign in below with your credentials.</span>
            </div>
          </div>
        )}

        {/* Email Verified Banner */}
        {isVerified && (
          <div className="p-4 rounded-2xl bg-[#DFEAF0] border border-[#467DA3]/30 text-[#467DA3] text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <MailCheck className="w-5 h-5 text-[#467DA3] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Email Address Verified!</span>
              <span className="text-[#3C5262]">Your email is confirmed. Please sign in to enter your patient portal.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/40 text-[#08786F] text-xs sm:text-sm flex items-center gap-3 shadow-2xs">
            <CheckCircle className="w-5 h-5 text-[#108B83] shrink-0" />
            <span>Login successful! Opening your patient portal...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#243847] mb-1.5">
              NIC / Mobile Number / Email *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 199512345678, 0771234567, or email"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#698399]/50 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#243847]">
                Password *
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#698399] hover:text-[#243847] focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#698399]" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm mt-3 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#D5E0E3] flex flex-col gap-2.5 text-center text-xs text-[#667986]">
          <div>
            Don&apos;t have a patient account?{" "}
            <Link href="/auth/patient-register" className="font-bold text-[#108B83] hover:underline">
              Register as a Citizen
            </Link>
          </div>
          <div>
            Hospital Staff or Medical Officer?{" "}
            <Link href="/auth/staff-login" className="font-bold text-[#467DA3] hover:underline">
              Healthcare Professional Portal &rarr;
            </Link>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EDF2F4] flex items-center justify-center text-sm text-[#667986]">
          Loading sign in...
        </div>
      }
    >
      <PatientLoginForm />
    </Suspense>
  );
}
