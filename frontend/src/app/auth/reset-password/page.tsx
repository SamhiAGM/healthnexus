"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mail,
  RefreshCw,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryToken = searchParams.get("token") || searchParams.get("code") || "";
  const queryEmail = searchParams.get("email") || "";

  const [token, setToken] = useState(queryToken);
  const [email, setEmail] = useState(queryEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (queryToken && !token) setToken(queryToken);
    if (queryEmail && !email) setEmail(queryEmail);
  }, [queryToken, queryEmail]);

  // Password strength criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Please enter the 6-digit recovery code or reset token received in your email.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet the minimum complexity requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          email: email.trim().toLowerCase(),
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Password reset code is invalid or has expired. Please request a new recovery code.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/patient-login");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please request a fresh recovery code.");
    } finally {
      setLoading(false);
    }
  };

  const isExpiredOrInvalid = error && (
    error.toLowerCase().includes("expired") ||
    error.toLowerCase().includes("invalid") ||
    error.toLowerCase().includes("exceeded")
  );

  return (
    <AuthLayout
      badgeText="Credential Reset Authorization"
      badgeIcon={ShieldCheck}
      badgeVariant="blue"
      imageSrc="/images/hospital_tech_connected.jpg"
      imageAlt="Hospital Security Infrastructure"
      headline="Create a Strong, Resilient Security Passcode."
      headlineDescription="Ensure your health records and personal diagnostics remain strictly confidential by selecting an updated, high-entropy password."
      featureCards={[
        {
          icon: Lock,
          title: "Strong Entropy Validation",
          desc: "Minimum 8 characters with lowercase, uppercase, numbers, and symbols.",
          iconColor: "text-sky-300",
        },
        {
          icon: KeyRound,
          title: "Single-Use Reset Token",
          desc: "Tokens are invalidated immediately upon successful credential update.",
          iconColor: "text-sky-300",
        },
      ]}
      securityNote="BCrypt Password Hashing &bull; Session Invalidation After Reset"
      title="Set New Security Password"
      subtitle="Provide your time-limited recovery code and choose a strong new password."
      backHref="/auth/patient-login"
      backLabel="Back to Sign In"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-2 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
            {isExpiredOrInvalid && (
              <div className="pt-1 pl-8">
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#108B83] hover:text-[#08786F] underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Request a new recovery code
                </Link>
              </div>
            )}
          </div>
        )}

        {success ? (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30 flex items-center justify-center text-[#08786F]">
              <CheckCircle className="w-8 h-8 text-[#08786F]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#243847]">Password Successfully Updated!</h3>
              <p className="text-xs sm:text-sm text-[#667986] mt-2 leading-relaxed">
                Your credentials have been securely updated using BCrypt and active sessions have been invalidated.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/auth/patient-login"
                className="w-full py-3.5 px-4 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs text-sm"
              >
                <span>Proceed to Patient Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#243847] mb-1">
                Reset Token / Security Code *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667986]" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste 6-digit code or reset token"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#667986]/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243847] mb-1">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667986]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.lk"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#667986]/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243847] mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667986]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#667986]/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667986] hover:text-[#243847]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Complexity Checklist */}
            {newPassword.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#E7EFF1]/70 border border-[#D5E0E3] text-[11px] space-y-1.5">
                <span className="font-bold text-[#243847] block mb-1">Password Requirements:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-[#08786F] font-semibold" : "text-[#667986]"}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-[#108B83]" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-[#08786F] font-semibold" : "text-[#667986]"}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-[#108B83]" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-[#08786F] font-semibold" : "text-[#667986]"}`}>
                    {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-[#108B83]" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-[#08786F] font-semibold" : "text-[#667986]"}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-[#108B83]" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 number (0-9)</span>
                  </div>
                  <div className={`col-span-2 flex items-center gap-1.5 ${hasSpecial ? "text-[#08786F] font-semibold" : "text-[#667986]"}`}>
                    {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-[#108B83]" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>1 special symbol (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#243847] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667986]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#667986]/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667986] hover:text-[#243847]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Passwords do not match yet.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token.trim() || !isPasswordValid || !passwordsMatch}
              className="w-full py-3.5 px-4 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow disabled:opacity-50 text-sm mt-2"
            >
              <span>{loading ? "Updating Security Credentials..." : "Confirm & Set New Password"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#D5E0E3] flex items-center justify-between text-xs text-[#667986]">
          <Link href="/auth/forgot-password" className="hover:text-[#243847] font-medium transition">
            &larr; Resend Token
          </Link>
          <Link href="/auth/patient-login" className="text-[#108B83] hover:text-[#08786F] font-bold transition">
            Back to Sign In &rarr;
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EDF2F4] flex items-center justify-center text-sm text-[#667986]">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
