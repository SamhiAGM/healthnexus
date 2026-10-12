"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { 
  User, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Building2, 
  CalendarCheck, 
  CheckCircle2,
  MailCheck
} from "lucide-react";

import { apiFetch, AuthResponse } from "@/lib/api";

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
      await apiFetch<AuthResponse>("/api/auth/login", {
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col lg:flex-row selection:bg-[#0F766E] selection:text-white">
      
      {/* LEFT COLUMN: Visual & Status Branding (Desktop 5/12) */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0D6A63] to-[#0A4D48] text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-300/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-100 text-xs font-semibold backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5 text-teal-200" />
            Hospital Clinic Portal
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Check Your Queues &amp; Manage Hospital Consultations.
          </h1>
          <p className="text-sm xl:text-base text-teal-50/90 leading-relaxed">
            Log in to view your live clinic waiting tokens, download medical reports, and confirm upcoming specialist appointments across NHSL and regional clinics.
          </p>

          <div className="grid grid-cols-1 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <CalendarCheck className="w-5 h-5 text-teal-200 mb-2" />
              <div className="text-sm font-bold text-white">Live Queue Synchronization</div>
              <div className="text-xs text-teal-100/80 mt-1">Real-time appointment schedule synchronization with NHSL and provincial hospitals.</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-teal-200 mb-2" />
              <div className="text-sm font-bold text-white">Digital Health Record Vault</div>
              <div className="text-xs text-teal-100/80 mt-1">Cryptographically hashed token authorization with automated patient reminders.</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-teal-100/80">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-200" />
            End-to-End Encrypted Session
          </span>
          <span>HealthNexus LK</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          <div className="lg:hidden flex justify-between items-center pb-3 border-b border-slate-200">
            <Logo variant="dark" size="sm" />
            <Link href="/" className="text-xs font-semibold text-[#0F766E] hover:underline">
              ← Back to Home
            </Link>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
              Patient Portal Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in with your Sri Lankan NIC, registered mobile number, or email.
            </p>
          </div>

          {/* Registration Success Banner */}
          {isRegistered && !isVerified && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 block">Registration Successful!</span>
                <span className="text-emerald-800">Your citizen profile has been registered in the national directory. Please sign in below with your credentials.</span>
              </div>
            </div>
          )}

          {/* Email Verified Banner */}
          {isVerified && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <MailCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-950 block">Email Address Verified!</span>
                <span className="text-teal-800">Your email is confirmed. Please sign in with your credentials to enter your patient portal.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Login successful! Opening your patient workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIC / Mobile Number / Email *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 199512345678, 0771234567, or email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password *
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-[#0F766E] hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-[#0F766E] hover:bg-[#14B8A6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50 text-sm mt-3"
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

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5 text-center text-xs text-slate-500">
            <div>
              Don&apos;t have a patient account?{" "}
              <Link href="/auth/patient-register" className="font-semibold text-[#0F766E] hover:underline">
                Register as a Citizen
              </Link>
            </div>
            <div>
              Hospital Staff or Medical Officer?{" "}
              <Link href="/auth/staff-login" className="font-semibold text-[#0F766E] hover:underline">
                Healthcare Professional Portal →
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm text-slate-500">
          Loading sign in...
        </div>
      }
    >
      <PatientLoginForm />
    </Suspense>
  );
}
