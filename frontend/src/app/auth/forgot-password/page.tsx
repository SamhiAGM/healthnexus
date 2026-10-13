"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  Mail,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Clock,
  ShieldCheck,
  Info,
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

      if (res.status === 429) {
        throw new Error("Too many password reset requests. Please wait a few minutes before trying again.");
      } else if (res.status >= 500) {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error && errJson.error.includes("unconfigured")) {
          throw new Error("Outbound email delivery is currently unconfigured in this environment. Please contact your hospital system administrator.");
        }
      }

      // Safe confirmation according to security best practice
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Unable to process password reset request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Account Security & Recovery"
      badgeIcon={KeyRound}
      badgeVariant="blue"
      imageSrc="/images/hospital_tech_connected.jpg"
      imageAlt="Hospital Connected Security Technology"
      headline="Restore Secure Access to Your Health Profile."
      headlineDescription="Our automated recovery protocol verifies your identity and issues a cryptographically signed recovery token directly to your registered email address."
      featureCards={[
        {
          icon: Clock,
          title: "15-Minute Ephemeral Window",
          desc: "Time-limited single-use security recovery tokens protect against unauthorized reset attempts.",
          iconColor: "text-sky-300",
        },
        {
          icon: ShieldCheck,
          title: "Zero-Knowledge Password Hash",
          desc: "Your credentials are stored using salted cryptographic hashes and can never be viewed in plaintext.",
          iconColor: "text-sky-300",
        },
      ]}
      securityNote="HealthNexus Cryptographic Perimeter &bull; Sri Lanka MoH 2026 Compliant"
      title="Recover Account Password"
      subtitle="Enter your registered email address to receive password reset instructions."
      backHref="/auth/patient-login"
      backLabel="Back to Patient Sign In"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#243847] mb-1.5">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667986]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kasun.perera@example.lk"
                  className="w-full pl-10 pr-4 py-3 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#667986]/60 transition"
                />
              </div>
              <p className="text-[11px] text-[#667986] mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#108B83] shrink-0" />
                We will dispatch a time-limited 15-minute recovery token to this address.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 px-4 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow disabled:opacity-50 text-sm"
            >
              <span>{loading ? "Transmitting Reset Request..." : "Send Reset Instructions"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30 flex items-center justify-center text-[#08786F]">
              <CheckCircle className="w-8 h-8 text-[#08786F]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#243847]">Recovery Instructions Dispatched</h3>
              <p className="text-xs sm:text-sm text-[#667986] mt-2 leading-relaxed">
                If an account associated with <strong className="text-[#243847]">{email}</strong> exists, password reset instructions with a secure time-limited token have been sent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E7EFF1]/70 border border-[#D5E0E3] text-left text-xs text-[#3C5262] space-y-2">
              <span className="font-bold text-[#243847] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#108B83]" />
                What to do next:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[#667986]">
                <li>Check your inbox and spam folder within 15 minutes.</li>
                <li>Enter the recovery token on the password reset page.</li>
                <li>Never share your security reset token with anyone.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full py-3 px-4 bg-[#108B83] hover:bg-[#08786F] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Enter Reset Token &amp; Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-[#667986] hover:text-[#243847] font-semibold transition"
              >
                Try a different email address
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#D5E0E3] flex items-center justify-between text-xs text-[#667986]">
          <Link href="/auth/patient-login" className="hover:text-[#243847] font-medium transition">
            &larr; Patient Sign In
          </Link>
          <Link href="/auth/staff-login" className="text-[#108B83] hover:text-[#08786F] font-bold transition">
            Staff Sign In &rarr;
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
