"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowLeft
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryToken = searchParams.get("token") || "";
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

  // Password strength checks
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
      setError("Please enter the recovery token received in your email.");
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
        throw new Error(data.error || "Password reset token is invalid or has expired. Please request a new token.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/patient-login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please request a fresh reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F7] text-[#364A5D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#159B94] selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#159B94]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#426DA9]/10 rounded-full blur-2xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="inline-block">
          <Logo variant="dark" size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFEFEC] border border-[#159B94]/30 text-xs font-bold text-[#087F79]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#087F79]" />
          Credential Reset Authorization
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20364C] tracking-tight">
          Set New Security Password
        </h2>
        <p className="text-xs sm:text-sm text-[#43566C]">
          Provide your time-limited reset token and choose a strong new password.
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

          {success && (
            <div className="p-4 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs sm:text-sm flex items-start gap-3 shadow-xs">
              <CheckCircle className="w-5 h-5 text-[#087F79] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Password Successfully Updated!</span>
                <span>Your account password has been updated. Redirecting you to patient sign in...</span>
              </div>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  Reset Token / Code *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43566C]" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. 6-digit code or reset token from email"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] placeholder:text-[#43566C]/50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43566C]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43566C] hover:text-[#20364C]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                <div className="mt-3 p-3 rounded-xl bg-[#E8F0F4] border border-[#D9E3E9] grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-[#087F79] font-semibold" : "text-[#43566C]"}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                    <span>At least 8 chars</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-[#087F79] font-semibold" : "text-[#43566C]"}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-[#087F79] font-semibold" : "text-[#43566C]"}`}>
                    {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber && hasSpecial ? "text-[#087F79] font-semibold" : "text-[#43566C]"}`}>
                    {hasNumber && hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                    <span>Number &amp; symbol</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#43566C]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43566C] hover:text-[#20364C]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-[11px] mt-1 ${passwordsMatch ? "text-[#087F79]" : "text-rose-600"}`}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full py-3.5 px-4 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <span>{loading ? "Updating Credentials..." : "Confirm & Save New Password"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center pt-2">
              <Link
                href="/auth/patient-login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#087F79] hover:bg-[#159B94] text-white text-sm font-bold rounded-xl shadow-md transition-all"
              >
                <span>Proceed to Patient Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="pt-5 border-t border-[#D9E3E9] flex items-center justify-between text-xs">
            <Link
              href="/auth/forgot-password"
              className="text-[#43566C] hover:text-[#20364C] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Request a new token
            </Link>
            <Link
              href="/auth/patient-login"
              className="text-[#087F79] font-bold hover:underline"
            >
              Sign In Instead &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F4F7] flex items-center justify-center text-[#20364C]">
        <div className="animate-pulse text-sm font-semibold">Loading password recovery...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
