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
  Info,
  Lock
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
      ? "Verification code could not be automatically dispatched. Please click Resend Code to try again."
      : null
  );
  const [success, setSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    isRegisteredFlow
      ? "Your patient account was created! Please verify your email to activate critical clinic alerts."
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
      setError(err.message || "Unable to dispatch verification email. Please try again shortly.");
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
      setError(err.message || "Failed to send verification code. Please check your email address.");
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
      const res = await apiFetch<any>("/api/auth/email/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode,
          otp: otpCode,
        }),
      });

      setSuccess(true);

      // Update non-sensitive profile state in localStorage if present
      if (typeof window !== "undefined") {
        try {
          const rawUser = localStorage.getItem("hc_user");
          if (rawUser) {
            const userObj = JSON.parse(rawUser);
            userObj.emailVerified = true;
            userObj.email = email.trim();
            localStorage.setItem("hc_user", JSON.stringify(userObj));
          }
        } catch {
          // ignore localStorage parsing errors
        }
      }

      // Route to patient sign in page after verification
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
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex selection:bg-teal-500 selection:text-white">
      {/* LEFT COLUMN: Cinematic Healthcare Visual & Trust Messaging */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0B1730] via-[#091529] to-[#040A14] border-r border-slate-800/80">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            HealthNexus Security Perimeter
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Verified Digital Identity for Secure Healthcare Delivery.
          </h1>
          <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
            Confirming your email address ensures uninterrupted receipt of vital clinic queue notifications, doctor consultation tokens, and official digital diagnostic reports.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-teal-400 mb-2" />
              <div className="text-sm font-bold text-white">Cryptographic OTP</div>
              <div className="text-xs text-slate-400 mt-1">Salted SHA-256 hash storage. Raw passcodes never persist in plaintext.</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <Clock className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-sm font-bold text-white">5-Minute Ephemeral TTL</div>
              <div className="text-xs text-slate-400 mt-1">Single-use verification token expires automatically after 300 seconds.</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <span>HealthNexus Mail Relay &bull; STARTTLS 587</span>
          </div>
          <span>SL-CERT &amp; PDPA Compliant</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive OTP Verification Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex justify-between items-center pb-2 border-b border-slate-800">
            <Logo variant="light" size="sm" />
            <Link href="/auth/patient-login" className="text-xs font-semibold text-teal-400 hover:text-teal-300">
              Sign In Instead &rarr;
            </Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-semibold mb-2">
              <Mail className="w-3.5 h-3.5" />
              Email Verification
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verify Your Email Address
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enter the 6-digit verification code sent from <span className="text-teal-300 font-medium">HealthNexus Support</span>.
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Verification Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {statusMessage && !error && (
            <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800/60 text-teal-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
              <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-in fade-in">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Email Address Verified!</div>
                <div className="text-emerald-300 text-xs mt-0.5">Redirecting to sign in with your credentials...</div>
              </div>
            </div>
          )}

          {/* Edit Email Accordion */}
          {editingEmail ? (
            <form onSubmit={handleUpdateEmail} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Target Email Address</span>
                {email && (
                  <button
                    type="button"
                    onClick={() => setEditingEmail(false)}
                    className="text-slate-400 hover:text-slate-200 text-[11px]"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-slate-200 truncate font-mono">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewEmailInput(email);
                  setEditingEmail(true);
                }}
                className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold text-xs shrink-0 ml-2"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </div>
          )}

          {/* OTP Input Form */}
          {!editingEmail && !success && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    6-Digit Verification Code *
                  </label>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className={`font-mono text-xs ${
                        expiresInSeconds <= 60 ? "text-amber-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      Expires in {formatTime(expiresInSeconds)}
                    </span>
                  </div>
                </div>

                {/* 6 Digit Boxes */}
                <div className="flex justify-between gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      aria-label={`Digit ${index + 1}`}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono bg-slate-900/90 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-inner transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={loading || otpDigits.join("").length !== 6 || expiresInSeconds <= 0}
                className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal-500/25 disabled:opacity-40 text-sm"
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Verify Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend & Cooldown */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldownSeconds > 0 || resending}
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-400 hover:text-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  {cooldownSeconds > 0 ? (
                    <span>Resend in {cooldownSeconds}s</span>
                  ) : (
                    <span>Resend Code</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Independent Verification Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Security Notice
            </div>
            <p>
              Email OTP independently validates your electronic mailbox for hospital appointments and lab results. It does not certify phone ownership or statutory citizen identification. Never share this 6-digit code with anyone.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/auth/patient-login"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip to Sign In
            </Link>
            <Link
              href="/auth/patient-login"
              className="text-teal-400 hover:text-teal-300 transition-colors font-semibold"
            >
              Sign In Instead &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070F1E] flex items-center justify-center text-slate-400">
          Loading email verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
