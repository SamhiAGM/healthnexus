"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  Clock,
  Sparkles,
  Info
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      // Even if email is not found, security best practice is to return generic confirmation
      if (res.status === 429) {
        throw new Error("Too many password reset requests. Please wait before trying again.");
      } else if (res.status >= 500) {
        // Backend service error or unconfigured mail provider
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error && errJson.error.includes("unconfigured")) {
          throw new Error("Outbound email delivery is currently unconfigured in this environment. Please contact your hospital system administrator or supportdesk.");
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Unable to process password reset request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F7] text-[#364A5D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#159B94] selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#159B94]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#426DA9]/10 rounded-full blur-2xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="inline-block">
          <Logo variant="dark" size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFEFEC] border border-[#159B94]/30 text-xs font-bold text-[#087F79]">
          <KeyRound className="w-3.5 h-3.5 text-[#087F79]" />
          Account Security & Recovery
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20364C] tracking-tight">
          Recover Your Password
        </h2>
        <p className="text-xs sm:text-sm text-[#43566C]">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1.5">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43566C]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kasun.perera@example.lk"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] placeholder:text-[#43566C]/50 transition"
                  />
                </div>
                <p className="text-[11px] text-[#43566C] mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#087F79] shrink-0" />
                  We will transmit a time-limited 15-minute recovery token to this address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <span>{loading ? "Transmitting Reset Request..." : "Send Reset Instructions"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#DFEFEC] border border-[#159B94]/30 flex items-center justify-center text-[#087F79]">
                <CheckCircle className="w-7 h-7 text-[#087F79]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#20364C]">Recovery Instructions Dispatched</h3>
                <p className="text-xs sm:text-sm text-[#43566C] mt-2 leading-relaxed">
                  If an account associated with <strong className="text-[#20364C]">{email}</strong> exists, password reset instructions with a secure time-limited token have been sent.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#E8F0F4] border border-[#D9E3E9] text-left text-xs text-[#364A5D] space-y-2">
                <span className="font-bold text-[#20364C] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#087F79]" />
                  What to do next:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[#43566C]">
                  <li>Check your inbox and spam folder within 15 minutes.</li>
                  <li>Click the link in the email or enter the token on the reset page.</li>
                  <li>Never share your reset token with anyone.</li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                  className="w-full py-3 px-4 bg-[#087F79] hover:bg-[#159B94] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Already Have Reset Token? Reset Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-[#43566C] hover:text-[#20364C]"
                >
                  Did not receive email? Try another address
                </button>
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-[#D9E3E9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <Link
              href="/auth/patient-login"
              className="text-[#087F79] font-bold hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Patient Login
            </Link>
            <Link
              href="/auth/staff-login"
              className="text-[#426DA9] font-bold hover:underline"
            >
              Staff Sign In &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
