"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { apiFetch } from "@/lib/api";
import { 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  Calendar, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Building2,
  HeartPulse
} from "lucide-react";

type IdentificationType = "NIC" | "PASSPORT" | "ASSISTED_GUARDIAN";

export default function PatientRegisterPage() {
  const router = useRouter();

  // Registration Form States
  const [idType, setIdType] = useState<IdentificationType>("NIC");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sri Lankan NIC Format Check
  const isValidNic = (val: string) => {
    return /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(val.trim());
  };

  // Generic ID validator based on selected type
  const validateIdentification = () => {
    const trimmed = idNumber.trim();
    if (!trimmed) return "Please enter your identification number.";
    
    if (idType === "NIC") {
      if (!isValidNic(trimmed)) {
        return "Please enter a valid Sri Lankan NIC (9 digits ending with V/X or modern 12 digits).";
      }
    } else if (idType === "PASSPORT") {
      if (trimmed.length < 6 || trimmed.length > 15) {
        return "Please enter a valid Passport Number (6 to 15 alphanumeric characters).";
      }
    } else if (idType === "ASSISTED_GUARDIAN") {
      if (trimmed.length < 5) {
        return "Please enter guardian's verified NIC or registered guardian ID.";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const idError = validateIdentification();
    if (idError) {
      setError(idError);
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setError("Please provide a valid Sri Lankan mobile phone number (e.g. 0771234567 or 0753999958).");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-check.");
      return;
    }

    if (!consentAgreed) {
      setError("You must agree to the healthcare data protection and privacy consent terms.");
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedId = idNumber.trim().toUpperCase();

      await apiFetch<any>("/api/auth/patients/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          identificationType: idType,
          idNumber: trimmedId,
          nic: idType === "NIC" ? trimmedId : undefined,
          phone: phone.trim(),
          email: trimmedEmail,
          dateOfBirth,
          password,
        }),
      });

      // Clear any stale local auth tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("hc_user");
        localStorage.removeItem("hc_token");
      }
      setSuccess(true);

      if (trimmedEmail) {
        try {
          await apiFetch("/api/auth/email/send-otp", {
            method: "POST",
            body: JSON.stringify({ email: trimmedEmail }),
          });
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(trimmedEmail)}&registered=1&id=${encodeURIComponent(trimmedId)}`);
          }, 1200);
          return;
        } catch {
          // If sending email failed (e.g. unconfigured SMTP in dev), still forward to verification page with truthful notice
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(trimmedEmail)}&error=send_failed&id=${encodeURIComponent(trimmedId)}`);
          }, 1200);
          return;
        }
      }

      setTimeout(() => {
        router.push(`/auth/patient-login?registered=1&id=${encodeURIComponent(trimmedId)}`);
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Registration could not be completed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D] flex flex-col lg:flex-row selection:bg-[#0F766E] selection:text-white">
      
      {/* LEFT COLUMN: Cinematic Healthcare Visual Showcase (Desktop 45%) */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0D6A63] to-[#0A4D48] text-white">
        {/* Soft Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-300/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header / Brand */}
        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-100 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            National Digital Healthcare Initiative
          </div>
        </div>

        {/* Center Presentation Info */}
        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Seamless Healthcare Access For Every Sri Lankan Citizen.
          </h1>
          <p className="text-sm xl:text-base text-teal-50/90 leading-relaxed">
            Create your unified patient profile to skip crowded waiting lines, book government hospital clinic sessions, and monitor live consultation tokens right from your phone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <Clock className="w-5 h-5 text-teal-200 mb-2" />
              <div className="text-sm font-bold text-white">Live Queue Tracking</div>
              <div className="text-xs text-teal-100/80 mt-1">Real-time token updates across NHSL, Kandy, Kinniya, and Galle.</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-teal-200 mb-2" />
              <div className="text-sm font-bold text-white">Cryptographic Privacy</div>
              <div className="text-xs text-teal-100/80 mt-1">Salted SHA-256 identity hashing & secure HttpOnly credentials.</div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-teal-100/80">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-300" />
            <span>Ministry of Health 2026 Registry</span>
          </div>
          <span>HealthNexus LK</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Registration Form (Desktop 55%, Full Mobile) */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl space-y-6">
          
          {/* Header Mobile Brand */}
          <div className="lg:hidden flex justify-between items-center pb-3 border-b border-slate-200">
            <Logo variant="dark" size="sm" />
            <Link href="/" className="text-xs font-semibold text-[#0F766E] hover:underline">
              ← Back to Home
            </Link>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
              Create Patient Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join HealthNexus (LankaCare.me) with your verified national identity document.
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{email.trim() ? "Account created! Routing to email OTP verification..." : "Account created successfully! Securely routing to patient portal..."}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Identification Type Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Identification Method *
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIdType("NIC"); setError(null); }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    idType === "NIC"
                      ? "bg-[#0F766E] text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sri Lankan NIC
                </button>
                <button
                  type="button"
                  onClick={() => { setIdType("PASSPORT"); setError(null); }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    idType === "PASSPORT"
                      ? "bg-[#0F766E] text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Passport
                </button>
                <button
                  type="button"
                  onClick={() => { setIdType("ASSISTED_GUARDIAN"); setError(null); }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    idType === "ASSISTED_GUARDIAN"
                      ? "bg-[#0F766E] text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Assisted / Guardian
                </button>
              </div>
            </div>

            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name (as stated on identity document) *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. AGM Samhi"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            {/* Dynamic ID Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  {idType === "NIC" && "National Identity Card (NIC) *"}
                  {idType === "PASSPORT" && "Passport Number *"}
                  {idType === "ASSISTED_GUARDIAN" && "Guardian NIC / Reference ID *"}
                </label>
                <span className="text-[10px] text-[#0F766E] font-medium">
                  {idType === "NIC" && "Supports 9-digit (V/X) & modern 12-digit"}
                  {idType === "PASSPORT" && "International / Sri Lankan Travel Document"}
                  {idType === "ASSISTED_GUARDIAN" && "For pediatric or dependent registration"}
                </span>
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={
                    idType === "NIC" ? "200334212365 or 951234567V" :
                    idType === "PASSPORT" ? "N1234567" : "Guardian's NIC / Reg No"
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] placeholder:text-slate-400 transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                Salted SHA-256 hash stored. Raw identity documents remain encrypted.
              </p>
            </div>

            {/* Mobile & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (SMS Alerts) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0753999958"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] placeholder:text-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Required for account verification) *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mohamedsamhi1207@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 8 chars) *
                </label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="consentCheck"
                type="checkbox"
                required
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] bg-white cursor-pointer"
              />
              <label htmlFor="consentCheck" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                I agree to the HealthNexus (LankaCare.me) privacy policy and consent to verified identification for hospital scheduling and real-time clinic queue management.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-[#0F766E] hover:bg-[#14B8A6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50 text-sm mt-3"
            >
              {loading ? (
                <span>Registering Citizen Profile...</span>
              ) : (
                <>
                  <span>Create Patient Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Already have an account?</span>
            <Link 
              href="/auth/patient-login" 
              className="font-semibold text-[#0F766E] hover:underline transition-colors"
            >
              Sign In to Patient Portal →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
