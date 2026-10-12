"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { apiFetch } from "@/lib/api";
import {
  Mail,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  RefreshCw,
  Edit3,
  Sparkles,
  Lock,
  Building2,
  KeyRound
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const isRegisteredFlow = searchParams.get("registered") === "1" || searchParams.get("registered") === "true";
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState(initialEmail);
  const [editingEmail, setEditingEmail] = useState(!initialEmail);
  const [newEmailInput, setNewEmailInput] = useState(initialEmail);

  // OTP 6-digit boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timers: 5-minute expiry (300s), 60-second resend cooldown
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
  const [statusMessage, setStatusMessage] = useState<string | null>(
    isRegisteredFlow
      ? "Your patient account has been created! Please verify your email to activate your account."
      : null
  );

  // Expiry countdown timer
  useEffect(() => {
    if (expiresInSeconds <= 0) return;
    const interval = setInterval(() => {
      setExpiresInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresInSeconds]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Handle individual digit input
  const handleDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    next[index] = numeric[numeric.length - 1]; // take latest char
    setOtpDigits(next);
    setError(null);

    // Auto-advance to next box
    if (index < 5 && numeric.length > 0) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste of 6-digit code
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

  // Resend OTP request
  const handleResend = async () => {
    if (cooldownSeconds > 0 || resending || !email.trim()) return;

    setResending(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await apiFetch<any>("/api/auth/email/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });

      setStatusMessage(res.message || "A new 6-digit verification code has been dispatched to your email.");
      setCooldownSeconds(res.cooldownSeconds || 60);
      setExpiresInSeconds(res.expiresInSeconds || 300);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Unable to dispatch verification email. Outbound mail requires valid SMTP credentials in Azure App Service.");
    } finally {
      setResending(false);
    }
  };

  // Update target email & request new OTP
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
        body: JSON.stringify({ email: newEmailInput.trim() }),
      });

      setEmail(newEmailInput.trim());
      setEditingEmail(false);
      setStatusMessage(res.message || `Verification code sent to ${newEmailInput.trim()}`);
      setCooldownSeconds(res.cooldownSeconds || 60);
      setExpiresInSeconds(res.expiresInSeconds || 300);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please check your email address or SMTP service availability.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (expiresInSeconds <= 0) {
      setError("This verification code has expired. Please request a new code below.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch<any>("/api/auth/email/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode,
          otp: otpCode,
        }),
      });

      setSuccess(true);

      const targetId = searchParams.get("id") || "";
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col lg:flex-row selection:bg-[#0F766E] selection:text-white">
      {/* LEFT COLUMN: Visual Branding & Security Assurance */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0D6A63] to-[#0A4D48] text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-300/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-100 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            HealthNexus Security Perimeter
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Verified Digital Identity for Secure Healthcare Delivery.
          </h1>
          <p className="text-sm xl:text-base text-teal-50/90 leading-relaxed">
            Confirming your email address ensures uninterrupted receipt of vital clinic queue notifications, doctor consultation tokens, and official digital diagnostic reports.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-teal-200 mb-2" />
              <div className="text-sm font-bold text-white">Cryptographic OTP</div>
              <div className="text-xs text-teal-100/80 mt-1">Salted HMAC-SHA256 hash storage. Raw passcodes never persist in plaintext.</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <Clock className="w-5 h-5 text-teal-200 mb-2" />
              <div className="text-sm font-bold text-white">5-Minute Ephemeral TTL</div>
              <div className="text-xs text-teal-100/80 mt-1">Single-use verification token expires automatically after 300 seconds.</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-teal-100/80">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-200" />
            <span>HealthNexus Mail Relay &bull; STARTTLS 587</span>
          </div>
          <span>HealthNexus LK</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive OTP Verification Card */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex justify-between items-center pb-3 border-b border-slate-200">
            <Logo variant="dark" size="sm" />
            <Link href="/auth/patient-login" className="text-xs font-semibold text-[#0F766E] hover:underline">
              ← Sign In
            </Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-bold mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              Two-Step Account Activation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
              Verify Your Email Address
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter the 6-digit verification code sent from <strong className="text-slate-800">HealthNexus Support</strong>.
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-950 block">Account Created — Email Dispatch Notice</span>
                  <span className="leading-relaxed text-amber-800">
                    Your patient account is registered! Automated email dispatch requires <strong className="font-mono text-amber-950">SPRING_MAIL_PASSWORD</strong> to be configured in Azure App Service settings.
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <span className="text-[11px] text-amber-700">
                  You can sign in immediately with your registered ID or email:
                </span>
                <Link
                  href={`/auth/patient-login?registered=1&id=${encodeURIComponent(searchParams.get("id") || email)}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#14B8A6] text-white font-semibold text-xs text-center transition shadow-sm inline-flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {statusMessage && !error && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <Mail className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Email verified successfully! Securely routing to patient sign in...</span>
            </div>
          )}

          {/* Target Email Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            {editingEmail ? (
              <form onSubmit={handleUpdateEmail} className="flex-1 flex gap-2">
                <input
                  type="email"
                  required
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white font-semibold text-xs hover:bg-[#14B8A6] transition disabled:opacity-50"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEmail(false)}
                  className="px-2 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs hover:bg-slate-300"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-mono font-medium text-slate-900">{email || "No email specified"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewEmailInput(email);
                    setEditingEmail(true);
                  }}
                  className="text-[#0F766E] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </>
            )}
          </div>

          {/* OTP Input Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-slate-700">
                  6-Digit Verification Code *
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Expires in {formatTime(expiresInSeconds)}</span>
                </div>
              </div>

              {/* 6 Digit Cells */}
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
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl bg-slate-50 border border-slate-200 text-[#172B4D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join("").length !== 6 || expiresInSeconds <= 0}
              className="w-full py-3.5 px-6 bg-[#0F766E] hover:bg-[#14B8A6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50 text-sm"
            >
              {loading ? (
                <span>Validating Security Code...</span>
              ) : (
                <>
                  <span>Confirm &amp; Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Cooldown Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">Did not receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldownSeconds > 0 || resending}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[#0F766E] font-semibold hover:bg-slate-100 transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : "Resend Code"}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <Link href="/auth/patient-register" className="hover:text-slate-700">
              ← Change Details
            </Link>
            <Link href="/auth/patient-login" className="text-[#0F766E] hover:underline font-semibold">
              Skip to Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm text-slate-500">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
