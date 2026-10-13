"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { apiFetch } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  RefreshCw,
  KeyRound,
  Mail,
  Edit3,
} from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const initialPurpose = searchParams.get("purpose") || "account-verification";
  const initialError = searchParams.get("error");
  const targetId = searchParams.get("id") || "";

  const [email, setEmail] = useState(initialEmail);
  const [editingEmail, setEditingEmail] = useState(!initialEmail);
  const [newEmailInput, setNewEmailInput] = useState(initialEmail);

  // OTP 6-digit state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timers: 5-minute expiry (300s), 60-second cooldown
  const [expiresInSeconds, setExpiresInSeconds] = useState<number>(300);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(60);

  // Status & feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(
    initialError === "send_failed"
      ? "Verification code could not be automatically dispatched. Email delivery requires SPRING_MAIL_PASSWORD to be configured in Azure App Service."
      : null
  );
  const [success, setSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Expiry countdown
  useEffect(() => {
    if (expiresInSeconds <= 0) return;
    const interval = setInterval(() => {
      setExpiresInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresInSeconds]);

  // Resend cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    next[index] = numeric[numeric.length - 1];
    setOtpDigits(next);
    setError(null);

    if (index < 5 && numeric.length > 0) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (!pasted) return;

    const digits = pasted.slice(0, 6).split("");
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = digits[i] || "";
    }
    setOtpDigits(next);
    setError(null);

    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0 || resending || !email.trim()) return;

    setResending(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await apiFetch<any>("/api/auth/email/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), purpose: initialPurpose }),
      });

      setStatusMessage(res.message || "A fresh 6-digit verification code has been dispatched.");
      setCooldownSeconds(res.cooldownSeconds || 60);
      setExpiresInSeconds(res.expiresInSeconds || 300);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Unable to dispatch verification code. Please try again shortly.");
    } finally {
      setResending(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await apiFetch<any>("/api/auth/email/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: newEmailInput.trim(), purpose: initialPurpose }),
      });

      setEmail(newEmailInput.trim());
      setEditingEmail(false);
      setStatusMessage(res.message || `Verification code sent to ${newEmailInput.trim()}`);
      setCooldownSeconds(res.cooldownSeconds || 60);
      setExpiresInSeconds(res.expiresInSeconds || 300);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to dispatch verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }

    if (expiresInSeconds <= 0) {
      setError("This security code has expired. Please request a new code below.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch<any>("/api/auth/email/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode,
          purpose: initialPurpose,
        }),
      });

      setSuccess(true);
      const idQuery = targetId ? `&id=${encodeURIComponent(targetId)}` : "";
      setTimeout(() => {
        router.push(`/auth/patient-login?verified=1${idQuery}`);
      }, 1600);
    } catch (err: any) {
      setError(err.message || "Verification failed. The code may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Two-Step Verification"
      badgeIcon={KeyRound}
      badgeVariant="teal"
      imageSrc="/images/patient_digital_care.jpg"
      imageAlt="Patient Two-Step Security Verification"
      headline="Instant Cryptographic Identity Verification."
      headlineDescription="HealthNexus requires two-factor verification to safeguard confidential electronic health records, diagnostic prescriptions, and patient identifiers across Sri Lanka."
      featureCards={[
        {
          icon: ShieldCheck,
          title: "Cryptographic Salted Hash",
          desc: "Raw passcodes are never retained in plaintext. Verified against keyed SHA-256 HMAC.",
          iconColor: "text-teal-200",
        },
        {
          icon: Clock,
          title: "Ephemeral 300s TTL",
          desc: "Verification tokens are single-use and automatically decommissioned upon verification.",
          iconColor: "text-teal-200",
        },
      ]}
      securityNote="HealthNexus Zero-Trust Perimeter &bull; Sri Lanka MoH 2026 Compliant"
      title="Enter Verification Code"
      subtitle="Input the 6-digit passcode delivered to your registered email address."
      backHref="/auth/patient-login"
      backLabel="Back to Sign In"
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-950 block">Verification Dispatch Notice</span>
                <span className="leading-relaxed text-amber-800">{error}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <span className="text-[11px] text-amber-700">
                You can proceed directly to sign in with your ID:
              </span>
              <Link
                href={`/auth/patient-login?registered=1&id=${encodeURIComponent(targetId || email)}`}
                className="px-3.5 py-1.5 rounded-xl bg-[#108B83] hover:bg-[#08786F] text-white font-bold text-xs text-center transition shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Status Notification */}
        {statusMessage && !error && (
          <div className="p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30 text-[#08786F] text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <Mail className="w-5 h-5 text-[#108B83] shrink-0 mt-0.5" />
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">Verification verified successfully! Securely directing to sign in...</span>
          </div>
        )}

        {/* Email Address Bar */}
        <div className="p-3.5 rounded-2xl bg-[#E7EFF1]/70 border border-[#D5E0E3] flex items-center justify-between text-xs">
          {editingEmail ? (
            <form onSubmit={handleUpdateEmail} className="flex-1 flex gap-2">
              <input
                type="email"
                required
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#D5E0E3] text-[#243847] text-xs focus:outline-none focus:ring-2 focus:ring-[#108B83]"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-[#108B83] text-white font-bold text-xs hover:bg-[#08786F] transition disabled:opacity-50"
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => setEditingEmail(false)}
                className="px-3 py-2 rounded-xl bg-[#D5E0E3] text-[#3C5262] text-xs hover:bg-[#cbd5db] font-semibold"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[#3C5262]">
                <Mail className="w-4 h-4 text-[#108B83]" />
                <span className="font-mono font-semibold text-[#243847]">{email || "No email specified"}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewEmailInput(email);
                  setEditingEmail(true);
                }}
                className="text-[#108B83] hover:text-[#08786F] flex items-center gap-1 font-bold transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            </>
          )}
        </div>

        {/* 6 Digit Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-[#243847]">
                6-Digit Security Token *
              </label>
              <div className="flex items-center gap-1.5 text-xs text-[#667986] font-mono">
                <Clock className="w-3.5 h-3.5 text-[#108B83]" />
                <span>Expires in <strong className="text-[#243847]">{formatTime(expiresInSeconds)}</strong></span>
              </div>
            </div>

            <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] focus:border-transparent transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.join("").length !== 6 || expiresInSeconds <= 0}
            className="w-full py-3.5 px-6 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow disabled:opacity-50 text-sm"
          >
            {loading ? (
              <span>Validating Passcode...</span>
            ) : (
              <>
                <span>Confirm &amp; Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Cooldown Section */}
        <div className="p-4 rounded-2xl bg-[#E7EFF1]/70 border border-[#D5E0E3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[#3C5262] font-medium">Need another code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldownSeconds > 0 || resending}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D5E0E3] text-[#108B83] font-bold hover:bg-[#F6F9F8] transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : "Resend Code"}
          </button>
        </div>

        {/* Bottom Nav Links */}
        <div className="pt-4 border-t border-[#D5E0E3] flex items-center justify-between text-xs text-[#667986]">
          <Link href="/auth/patient-login" className="hover:text-[#243847] font-medium transition">
            &larr; Patient Sign In
          </Link>
          <Link href="/auth/staff-login" className="text-[#108B83] hover:text-[#08786F] font-bold transition">
            Staff Portal Sign In &rarr;
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EDF2F4] flex items-center justify-center text-sm text-[#667986]">
          Loading verification interface...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
