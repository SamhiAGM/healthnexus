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
  FileCheck2,
  HeartPulse,
  Clock,
  Sparkles
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
      setError("Please provide a valid Sri Lankan mobile phone number (e.g. 0771234567).");
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
      const data = await apiFetch<any>("/api/auth/patients/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          identificationType: idType,
          idNumber: idNumber.trim().toUpperCase(),
          nic: idType === "NIC" ? idNumber.trim().toUpperCase() : undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          dateOfBirth,
          password,
        }),
      });

      // Ensure clean state; user must sign in with credentials
      if (typeof window !== "undefined") {
        localStorage.removeItem("hc_user");
        localStorage.removeItem("hc_token");
      }
      setSuccess(true);

      const trimmedEmail = email.trim();
      const trimmedId = idNumber.trim().toUpperCase();
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
          // If sending failed (e.g. SMTP unavailable or rate limited), forward to verification screen with warning, never fake success
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
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex selection:bg-teal-500 selection:text-white">
      
      {/* LEFT COLUMN: Cinematic Healthcare Visual & Platform Assurance (Desktop 50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0B1730] via-[#091529] to-[#040A14] border-r border-slate-800/80">
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header / Brand */}
        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            National Digital Healthcare Initiative
          </div>
        </div>

        {/* Center Presentation Info */}
        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Seamless Healthcare Access For Every Sri Lankan Citizen.
          </h1>
          <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
            Create your unified patient profile to skip crowded waiting lines, book government hospital clinic sessions, and monitor live consultation tokens right from your phone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <Clock className="w-5 h-5 text-teal-400 mb-2" />
              <div className="text-sm font-bold text-white">Live Queue Tracking</div>
              <div className="text-xs text-slate-400 mt-1">Real-time token updates across NHSL, Kandy, and Karapitiya.</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-sm font-bold text-white">Cryptographic Privacy</div>
              <div className="text-xs text-slate-400 mt-1">Salted SHA-256 identity hashing & secure HttpOnly credentials.</div>
            </div>
          </div>
        </div>

        {/* Bottom Hospital Partnership Trust Badge */}
        <div className="relative z-10 pt-6 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Ministry of Health Integrated Partner Network</span>
          </div>
          <span>SL-CERT Compliant</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Registration Form (Desktop 50%, Full Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl space-y-6">
          
          {/* Header Mobile Brand */}
          <div className="lg:hidden flex justify-between items-center pb-2 border-b border-slate-800">
            <Logo variant="light" size="sm" />
            <Link href="/" className="text-xs font-semibold text-teal-400 hover:text-teal-300">
              ← Back to Home
            </Link>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Patient Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join HealthConnect LK with your verified national identity document.
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{email.trim() ? "Account created! Routing to email OTP verification..." : "Account created successfully! Securely routing to patient portal..."}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Identification Type Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Identification Method *
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIdType("NIC"); setError(null); }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    idType === "NIC"
                      ? "bg-teal-600 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sri Lankan NIC
                </button>
                <button
                  type="button"
                  onClick={() => { setIdType("PASSPORT"); setError(null); }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    idType === "PASSPORT"
                      ? "bg-teal-600 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Passport
                </button>
                <button
                  type="button"
                  onClick={() => { setIdType("ASSISTED_GUARDIAN"); setError(null); }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    idType === "ASSISTED_GUARDIAN"
                      ? "bg-teal-600 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Assisted / Guardian
                </button>
              </div>
            </div>

            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name (as stated on identity document) *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kasun Chamara Perera"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Dynamic ID Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {idType === "NIC" && "National Identity Card (NIC) *"}
                  {idType === "PASSPORT" && "Passport Number *"}
                  {idType === "ASSISTED_GUARDIAN" && "Guardian NIC / Reference ID *"}
                </label>
                <span className="text-[10px] text-teal-400 font-medium">
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
                    idType === "NIC" ? "199512345678 or 951234567V" :
                    idType === "PASSPORT" ? "N1234567" : "Guardian's NIC / Reg No"
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm uppercase focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                Salted SHA-256 hash stored. Raw identity documents remain encrypted.
              </p>
            </div>

            {/* Mobile & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number (SMS Alerts) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0771234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Optional Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address (Optional for digital receipts)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasun.perera@example.lk"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                className="mt-1 h-4 w-4 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="consentCheck" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                I agree to the HealthConnect LK privacy policy and give consent for verified identification to be used for hospital appointment scheduling and real-time live queue management.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 text-sm mt-3"
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
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>Already have an account?</span>
            <Link 
              href="/auth/patient-login" 
              className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Sign In to Patient Portal →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
