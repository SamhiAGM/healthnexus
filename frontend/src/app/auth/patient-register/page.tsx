"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
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
  Building2, 
  CalendarCheck, 
  CheckCircle2, 
  UserPlus 
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
      setError("Please provide a valid Sri Lankan mobile phone number (e.g. 0771234567 or 0712345678).");
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
    <AuthLayout
      badgeText="Citizen Registration"
      badgeIcon={UserPlus}
      badgeVariant="teal"
      imageSrc="/images/hospital_reception.jpg"
      imageAlt="Modern Sri Lankan Hospital Registration Reception"
      headline="Your Digital Healthcare Passport for Sri Lanka."
      headlineDescription="Create a verified citizen account to request clinic consultations, receive automated queue tokens, and access medical records across the public hospital network."
      featureCards={[
        {
          icon: CalendarCheck,
          title: "Outpatient Queue Tokens",
          desc: "Schedule specialist hospital clinics with real-time wait countdowns.",
          iconColor: "text-teal-200",
        },
        {
          icon: ShieldCheck,
          title: "Government Privacy Standards",
          desc: "NIC records protected with irreversible cryptographic hashes.",
          iconColor: "text-blue-200",
        },
      ]}
      title="Create Patient Account"
      subtitle="Register with your Sri Lankan National Identity Card (NIC) or Passport."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-5">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/40 text-[#08786F] text-xs sm:text-sm flex items-center gap-3 shadow-2xs">
            <CheckCircle className="w-5 h-5 text-[#108B83] shrink-0" />
            <span>Registration successful! Directing to email verification...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Identification Document Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#243847] mb-1.5">
              Identity Verification Document *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "NIC", label: "National ID (NIC)" },
                { type: "PASSPORT", label: "Passport" },
                { type: "ASSISTED_GUARDIAN", label: "Guardian" },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    setIdType(opt.type as IdentificationType);
                    setIdNumber("");
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition border text-center ${
                    idType === opt.type
                      ? "bg-[#DDEFE9] text-[#08786F] border-[#108B83]"
                      : "bg-[#F6F9F8] text-[#698399] border-[#D5E0E3] hover:text-[#243847]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#243847] mb-1.5">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kasun Chamara Perera"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#698399]/50 transition"
              />
            </div>
          </div>

          {/* Identification Number */}
          <div>
            <label className="block text-xs font-semibold text-[#243847] mb-1.5">
              {idType === "NIC"
                ? "Sri Lankan NIC Number *"
                : idType === "PASSPORT"
                ? "Passport Number *"
                : "Guardian Verified NIC *"}
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={idType === "NIC" ? "e.g. 199512345678 or 951234567V" : "e.g. N1234567"}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#698399]/50 font-mono transition"
              />
            </div>
          </div>

          {/* Phone & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#698399]/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Date of Birth *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] transition"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#243847] mb-1.5">
              Email Address (For Verification OTP) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasun.perera@example.lk"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#698399]/50 transition"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Password (min 8 chars) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-9 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#698399] hover:text-[#243847]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-9 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#698399] hover:text-[#243847]"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-[#667986] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-0.5 rounded text-[#108B83] focus:ring-[#108B83]"
              />
              <span>
                I consent to the processing of my healthcare identification under Sri Lankan data privacy standards for clinic appointment scheduling.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm mt-3 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration & Verify Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#D5E0E3] text-center text-xs text-[#667986]">
          Already have a patient profile?{" "}
          <Link href="/auth/patient-login" className="font-bold text-[#108B83] hover:underline">
            Sign In Here &rarr;
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}
