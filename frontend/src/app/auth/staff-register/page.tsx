"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { apiFetch } from "@/lib/api";
import { 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  UserPlus, 
  FileCheck2, 
  Search 
} from "lucide-react";

export default function StaffRegisterPage() {
  const router = useRouter();

  // Multi-step tracking: 1: Personal & Role, 2: Facility & Credentials, 3: Security & Consent, 4: Submitted
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    contactPhone: "",
    employeeId: "",
    requestedRole: "DOCTOR",
    professionalCategory: "Medical Officer",
    professionalRegistrationNumber: "",
    facilityId: "NHSL",
    facilityName: "National Hospital of Sri Lanka (NHSL)",
    department: "Cardiology Outpatient Clinic",
    password: "",
    confirmPassword: "",
    complianceConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Status check modal/state
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [lookupRequestId, setLookupRequestId] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [statusResult, setStatusResult] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const hospitals = [
    { id: "NHSL", name: "National Hospital of Sri Lanka (NHSL)" },
    { id: "TH_KANDY", name: "National Hospital Kandy" },
    { id: "TH_KARAPITIYA", name: "Teaching Hospital Karapitiya" },
    { id: "TH_JAFFNA", name: "Teaching Hospital Jaffna" },
    { id: "BH_KINNIYA", name: "Base Hospital Kinniya" },
    { id: "CSTH", name: "Castle Street Hospital for Women" },
    { id: "LRH", name: "Lady Ridgeway Hospital for Children" },
  ];

  const roles = [
    { id: "DOCTOR", name: "Medical Doctor / Clinician", council: "Sri Lanka Medical Council (SLMC)", placeholder: "e.g. SLMC-64821" },
    { id: "NURSE", name: "Nursing Staff & Triage", council: "Sri Lanka Nursing Council (SLNC)", placeholder: "e.g. SLNC-38104" },
    { id: "PHARMACIST", name: "Hospital Pharmacist", council: "Pharmacy Council of Sri Lanka", placeholder: "e.g. SLPC-12490" },
    { id: "LAB_STAFF", name: "Laboratory Technologist", council: "Medical Laboratory Registration", placeholder: "e.g. MLT-0982" },
    { id: "RECEPTIONIST", name: "Hospital Desk & Check-in", council: "Institutional Employee Registry", placeholder: "Optional / Not applicable" },
    { id: "FIELD_SUPERVISOR", name: "Field Supervision Officer", council: "Ministry of Health Registry", placeholder: "e.g. MOH-FS-441" },
    { id: "PUBLIC_HEALTH_OFFICER", name: "Public Health Officer (PHI)", council: "Public Health Inspector Registration", placeholder: "e.g. PHI-8821" },
    { id: "HOSPITAL_ADMIN", name: "Hospital Administrator", council: "Hospital Management Directorate", placeholder: "e.g. MOH-ADM-012" },
  ];

  const selectedRoleConfig = roles.find((r) => r.id === formData.requestedRole) || roles[0];

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.fullName.trim() || !formData.workEmail.trim() || !formData.contactPhone.trim() || !formData.employeeId.trim()) {
      setError("Please fill in all personal and professional identifier fields.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (["DOCTOR", "NURSE"].includes(formData.requestedRole) && !formData.professionalRegistrationNumber.trim()) {
      setError(`Official registration number with ${selectedRoleConfig.council} is mandatory.`);
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError("Security password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.complianceConsent) {
      setError("You must acknowledge that all credentials will be verified by the Hospital Administration before activation.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<any>("/api/staff/access-requests", {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          employeeId: formData.employeeId.trim().toUpperCase(),
          workEmail: formData.workEmail.trim().toLowerCase(),
          contactPhone: formData.contactPhone.trim(),
          requestedRole: formData.requestedRole,
          professionalCategory: formData.professionalCategory,
          professionalRegistrationNumber: formData.professionalRegistrationNumber.trim().toUpperCase(),
          facilityId: formData.facilityId,
          facilityName: formData.facilityName,
          department: formData.department.trim(),
          password: formData.password,
        }),
      });

      setSubmittedData(data);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your application.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupLoading(true);

    try {
      const res = await apiFetch<any>(`/api/staff/access-requests/status?requestId=${encodeURIComponent(lookupRequestId.trim())}&email=${encodeURIComponent(lookupEmail.trim().toLowerCase())}`);
      setStatusResult(res);
    } catch (err: any) {
      setLookupError(err.message || "No matching access request found for these credentials.");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Staff Credentialing"
      badgeIcon={ShieldCheck}
      badgeVariant="blue"
      imageSrc="/images/staff_collaboration.jpg"
      imageAlt="Sri Lankan Healthcare Team Collaborating on Clinical Case"
      headline="Verified Healthcare Professional Registration."
      headlineDescription="Submit official medical credentials for administrative verification. Access is role-enforced and gated by institutional approval."
      featureCards={[
        {
          icon: Stethoscope,
          title: "SLMC / SLNC Governance",
          desc: "Clinical roles require validation against official professional registries.",
          iconColor: "text-teal-200",
        },
        {
          icon: ShieldCheck,
          title: "Administrative Approval Gate",
          desc: "Hospital directors verify staff identities prior to clinical privilege grants.",
          iconColor: "text-blue-200",
        },
      ]}
      title="Hospital Staff Application"
      subtitle="Register as a medical officer, nurse, pharmacist, lab technologist, or hospital administrator."
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-5">
        
        {/* Step Indicator (Steps 1 to 3) */}
        {step < 4 && !checkingStatus && (
          <div className="flex items-center justify-between pb-3 border-b border-[#D5E0E3] text-xs">
            <span className="font-bold text-[#243847]">Step {step} of 3</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1.5 rounded-full transition-all ${
                    step >= s ? "bg-[#108B83]" : "bg-[#D5E0E3]"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCheckingStatus(true)}
              className="text-[#108B83] hover:underline font-semibold flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Check Status</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* APPLICATION STATUS LOOKUP VIEW */}
        {checkingStatus && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#243847] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#108B83]" />
                Check Staff Application Status
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCheckingStatus(false);
                  setStatusResult(null);
                  setLookupError(null);
                }}
                className="text-xs text-[#667986] hover:text-[#243847]"
              >
                &larr; Back to Form
              </button>
            </div>

            {lookupError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {lookupError}
              </div>
            )}

            {statusResult && (
              <div className="p-4 rounded-2xl bg-[#DFEAF0] border border-[#467DA3]/30 text-xs space-y-2 text-[#243847]">
                <div className="flex items-center justify-between font-bold">
                  <span>Application: {statusResult.requestId}</span>
                  <span className={`px-2 py-0.5 rounded-full ${statusResult.status === "APPROVED" ? "bg-[#DDEFE9] text-[#08786F]" : "bg-amber-100 text-amber-900"}`}>
                    {statusResult.status}
                  </span>
                </div>
                <div>Facility: {statusResult.facility}</div>
                <div>Requested Role: {statusResult.requestedRole}</div>
                <p className="text-[#667986] pt-1">
                  {statusResult.status === "PENDING"
                    ? "Your application is currently under administrative credential verification."
                    : "Your application has been processed. If approved, you can sign in directly."}
                </p>
              </div>
            )}

            <form onSubmit={handleStatusLookup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#243847] mb-1">
                  Application Request ID *
                </label>
                <input
                  type="text"
                  required
                  value={lookupRequestId}
                  onChange={(e) => setLookupRequestId(e.target.value)}
                  placeholder="e.g. REQ-123456"
                  className="w-full px-3.5 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243847] mb-1">
                  Registered Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  placeholder="doctor@hospital.lk"
                  className="w-full px-3.5 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847]"
                />
              </div>

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full py-3 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl text-xs transition"
              >
                {lookupLoading ? "Checking..." : "Look Up Status"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 1: Personal & Role Details */}
        {!checkingStatus && step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Full Professional Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Priyantha Jayasuriya"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Requested Operational Role *
              </label>
              <select
                value={formData.requestedRole}
                onChange={(e) => setFormData({ ...formData, requestedRole: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                  Institutional Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                  <input
                    type="email"
                    required
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    placeholder="doctor@hospital.lk"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                  Employee / Hospital ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="e.g. EMP-99214"
                  className="w-full px-3.5 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Official Contact Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="077-1234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              <span>Continue to Facility & Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Facility & Registration Number */}
        {!checkingStatus && step === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Healthcare Institution / Hospital *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                <select
                  value={formData.facilityId}
                  onChange={(e) => {
                    const match = hospitals.find((h) => h.id === e.target.value);
                    setFormData({
                      ...formData,
                      facilityId: e.target.value,
                      facilityName: match?.name || "National Healthcare Institution",
                    });
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                Assigned Clinical Department / Ward *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Cardiology Outpatient Clinic or Ward 4A"
                className="w-full px-3.5 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#243847] mb-1">
                {selectedRoleConfig.council} Registration Number *
              </label>
              <input
                type="text"
                required={["DOCTOR", "NURSE"].includes(formData.requestedRole)}
                value={formData.professionalRegistrationNumber}
                onChange={(e) => setFormData({ ...formData, professionalRegistrationNumber: e.target.value })}
                placeholder={selectedRoleConfig.placeholder}
                className="w-full px-3.5 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-[#E7EFF1] hover:bg-[#DDEFE9] text-[#243847] font-bold rounded-xl text-xs"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>Continue to Security</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Password & Compliance Consent */}
        {!checkingStatus && step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#698399]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-9 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#698399]"
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
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-9 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-sm text-[#243847]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#698399]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-[#667986] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.complianceConsent}
                  onChange={(e) => setFormData({ ...formData, complianceConsent: e.target.checked })}
                  className="mt-0.5 rounded text-[#108B83] focus:ring-[#108B83]"
                />
                <span>
                  I certify that all medical and institutional credentials provided are accurate and subject to verification by the Hospital Directorate and Ministry of Health.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 bg-[#E7EFF1] hover:bg-[#DDEFE9] text-[#243847] font-bold rounded-xl text-xs"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3.5 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <span>{loading ? "Submitting Application..." : "Submit Access Request"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Submitted / Staff Approval Pending View */}
        {step === 4 && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-3xl bg-[#DDEFE9] text-[#08786F] flex items-center justify-center mx-auto border border-[#108B83]/30">
              <FileCheck2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#243847]">Application Submitted</h3>
              <p className="text-xs text-[#667986] mt-1 max-w-sm mx-auto">
                Your staff access request has been lodged in the institutional queue.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#DFEAF0] border border-[#467DA3]/30 text-xs text-left space-y-2 text-[#243847]">
              <div className="flex justify-between font-bold">
                <span>Application Reference:</span>
                <span className="font-mono text-[#467DA3]">{submittedData?.requestId || "REQ-SUBMITTED"}</span>
              </div>
              <div className="flex justify-between">
                <span>Facility:</span>
                <span>{submittedData?.facility || formData.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  PENDING APPROVAL
                </span>
              </div>
              <div className="pt-2 text-[11px] text-[#667986] border-t border-[#D5E0E3]">
                An administrator will verify your credentials against the council registry. You will receive an email once approved.
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/auth/staff-login"
                className="w-full py-3 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl text-xs transition"
              >
                Return to Staff Login
              </Link>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#D5E0E3] text-center text-xs text-[#667986]">
          Already have verified credentials?{" "}
          <Link href="/auth/staff-login" className="font-bold text-[#108B83] hover:underline">
            Sign In Here &rarr;
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}
