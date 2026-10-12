"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Stethoscope,
  Building2,
  CalendarCheck,
  CheckCircle2
} from "lucide-react";

import { apiFetch, AuthResponse } from "@/lib/api";

export default function PatientLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
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
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex selection:bg-teal-500 selection:text-white">
      
      {/* LEFT COLUMN: Visual & Status Branding (Desktop 50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0B1730] via-[#091529] to-[#040A14] border-r border-slate-800/80">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            Hospital Clinic Portal
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Check Your Queues & Manage Hospital Consultations.
          </h1>
          <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
            Log in to view your live clinic waiting tokens, download medical reports, and confirm upcoming specialist appointments.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-xs text-slate-300">
              <CalendarCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Real-time appointment schedule synchronization with NHSL and regional hospitals.</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated SMS notifications when your queue token is called.</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            End-to-End Encrypted Session
          </span>
          <span>Security Standard: TLS 1.3 / ISO 27001</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          
          <div className="lg:hidden flex justify-between items-center pb-2 border-b border-slate-800">
            <Logo variant="light" size="sm" />
            <Link href="/" className="text-xs font-semibold text-teal-400 hover:text-teal-300">
              ← Back to Home
            </Link>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Patient Portal Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in with your Sri Lankan NIC, registered mobile number, or email.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Login successful! Opening your patient workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NIC / Mobile Number / Email *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 199512345678, 0771234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => alert("Self-service OTP reset: Enter your mobile number on the next step.")}
                  className="text-[11px] text-teal-400 hover:text-teal-300"
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 text-sm mt-3"
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

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5 text-center text-xs text-slate-400">
            <div>
              Don't have a patient account?{" "}
              <Link href="/auth/patient-register" className="font-semibold text-teal-400 hover:text-teal-300">
                Register as a Citizen
              </Link>
            </div>
            <div>
              Hospital Staff or Medical Officer?{" "}
              <Link href="/auth/staff-login" className="font-semibold text-blue-400 hover:text-blue-300">
                Healthcare Professional Portal →
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
