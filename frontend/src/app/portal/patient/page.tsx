"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { getCurrentUser, logoutUser } from "@/lib/api";
import { 
  Activity, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  LogOut,
  Building2,
  FileText,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Mail,
  CheckCircle,
  Search,
  Sparkles,
  Compass,
  ArrowRight
} from "lucide-react";
import { 
  PremiumStatCard, 
  ChartCard, 
  StatusIndicator, 
  EmptyState, 
  RoleIllustration 
} from "@/components/portal/DashboardComponents";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";

interface Appointment {
  id: string;
  facilityName: string;
  clinic: string;
  date: string;
  timeSlot: string;
  doctorName: string;
  status: "CONFIRMED" | "WAITING" | "COMPLETED" | "CANCELLED";
  queueTicket?: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Kasun Chamara Perera");
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "book" | "history">("overview");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Live Queue Ticket State (Real-time demonstrator)
  const [queueData, setQueueData] = useState({
    ticketNumber: "C-024",
    clinic: "Cardiology Outpatient Clinic",
    hospital: "National Hospital of Sri Lanka (NHSL)",
    room: "Consultation Room 04",
    servingToken: "C-020",
    patientsAhead: 4,
    estimatedWaitMinutes: 18,
    status: "WAITING",
  });

  // Appointments List
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "APT-8041",
      facilityName: "National Hospital of Sri Lanka (NHSL)",
      clinic: "Cardiology Clinic",
      date: "Today, 11 Oct 2026",
      timeSlot: "09:30 AM - 11:30 AM",
      doctorName: "Dr. Samantha Senanayake, MBBS",
      status: "WAITING",
      queueTicket: "C-024",
    },
    {
      id: "APT-7520",
      facilityName: "Castle Street Hospital for Women",
      clinic: "General OPD Follow-up",
      date: "24 Oct 2026",
      timeSlot: "08:00 AM - 10:00 AM",
      doctorName: "Dr. Nilmini Jayasinghe",
      status: "CONFIRMED",
    },
  ]);

  // Appointment Booking Form State
  const [bookForm, setBookForm] = useState({
    hospital: "National Hospital of Sri Lanka (NHSL)",
    clinic: "Cardiology Clinic",
    date: "",
    timeSlot: "Morning Session (08:30 AM - 12:00 PM)",
    notes: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user) {
        router.push("/auth/patient-login");
        return;
      }
      if (user.fullName) setUserName(user.fullName);
      if (user.email) {
        setUserEmail(user.email);
        setEmailVerified(user.emailVerified === true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/patient-login");
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityName: bookForm.hospital,
      clinic: bookForm.clinic,
      date: bookForm.date || "18 Oct 2026",
      timeSlot: bookForm.timeSlot,
      doctorName: "Assigned Consultant",
      status: "CONFIRMED",
    };
    setAppointments([newApt, ...appointments]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab("overview");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F7] text-[#364A5D] flex flex-col selection:bg-[#159B94] selection:text-white">
      {/* Top Patient Header with Balanced Design Tokens */}
      <header className="bg-[#F8FAFB]/95 border-b border-[#D9E3E9] sticky top-0 z-40 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="dark" size="sm" />
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/30 shadow-2xs">
              Patient Care Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Hospital Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F4F7] hover:bg-[#E8F0F4] border border-[#D9E3E9] text-xs text-[#43566C] transition"
            >
              <Search className="w-3.5 h-3.5 text-[#087F79]" />
              <span>Search Hospitals...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#D9E3E9] rounded text-[#43566C]">⌘K</kbd>
            </button>

            <Link
              href="/hospitals"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F0F4] hover:bg-[#DFEFEC] text-[#426DA9] border border-[#D9E3E9] text-xs font-bold transition"
            >
              <Compass className="w-3.5 h-3.5 text-[#087F79]" />
              <span>Hospitals Directory</span>
            </Link>

            <div className="flex items-center gap-2.5 text-xs pl-2 border-l border-[#D9E3E9]">
              <RoleIllustration role="PATIENT" size="sm" />
              <div className="hidden sm:block text-left">
                <div className="font-bold text-[#20364C] leading-tight flex items-center gap-1.5">
                  <span>{userName}</span>
                  {userEmail && emailVerified && (
                    <span title="Email Address Verified" className="text-[#087F79]">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="text-[#43566C] text-[10px] flex items-center gap-1.5">
                  <span>Citizen Patient</span>
                  {userEmail && !emailVerified && (
                    <span className="text-amber-600 font-bold">&bull; Email Unverified</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-[#43566C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Email Verification Action Banner if Unverified */}
        {userEmail && !emailVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-amber-950">Email Verification Pending</div>
                <div className="text-amber-800 text-[11px] mt-0.5">
                  Confirm your email ({userEmail}) to activate instant clinic notifications and digital medical receipts.
                </div>
              </div>
            </div>
            <Link
              href={`/auth/verify-email?email=${encodeURIComponent(userEmail)}`}
              className="px-4 py-2 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl text-xs transition-colors shrink-0 text-center shadow-xs"
            >
              Verify Email Now &rarr;
            </Link>
          </div>
        )}
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F8FAFB] border border-[#D9E3E9] p-6 rounded-2xl shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFEFEC] border border-[#159B94]/30 text-xs font-bold text-[#087F79]">
              <Sparkles className="w-3.5 h-3.5 text-[#087F79]" />
              Connected Healthcare Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20364C] tracking-tight">
              Ayubowan, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-[#43566C]">
              Track your live clinic waiting tokens, manage appointments, and access verified hospital consultations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("book")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#087F79] hover:bg-[#159B94] text-white text-xs font-bold transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Request Appointment
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#D9E3E9] pb-4">
          <div className="flex items-center gap-2 bg-[#E8F0F4] p-1 rounded-xl border border-[#D9E3E9]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "overview"
                  ? "bg-[#F8FAFB] text-[#20364C] shadow-xs font-bold"
                  : "text-[#43566C] hover:text-[#20364C]"
              }`}
            >
              My Care &amp; Live Queue
            </button>
            <button
              onClick={() => setActiveTab("book")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "book"
                  ? "bg-[#F8FAFB] text-[#20364C] shadow-xs font-bold"
                  : "text-[#43566C] hover:text-[#20364C]"
              }`}
            >
              Request Appointment
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "history"
                  ? "bg-[#F8FAFB] text-[#20364C] shadow-xs font-bold"
                  : "text-[#43566C] hover:text-[#20364C]"
              }`}
            >
              Visit Records
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & LIVE QUEUE TRACKER */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in-50 duration-200">
            
            {/* Live Queue Ticket Card */}
            <div className="relative rounded-2xl bg-[#F8FAFB] border border-[#159B94]/50 p-6 sm:p-8 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#159B94]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D9E3E9] pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#087F79] mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#159B94] animate-pulse" />
                    Active Live Queue Ticket
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#20364C]">
                    {queueData.clinic}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#43566C] flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-[#087F79] shrink-0" />
                    {queueData.hospital} &bull; {queueData.room}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[#F0F4F7] border border-[#D9E3E9] px-6 py-4 rounded-2xl shadow-xs">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#43566C] uppercase">Your Token</div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#087F79]">
                      {queueData.ticketNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Flow Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="p-4 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#43566C]">Current Token Serving</span>
                  <div className="text-2xl font-extrabold text-[#20364C] mt-1">{queueData.servingToken}</div>
                  <span className="text-[11px] text-[#087F79] font-medium">Consultation In Progress</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#43566C]">Patients Ahead of You</span>
                  <div className="text-2xl font-extrabold text-[#20364C] mt-1">{queueData.patientsAhead}</div>
                  <span className="text-[11px] text-[#426DA9] font-medium">Steady clinic flow</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#43566C]">Estimated Waiting Time</span>
                  <div className="text-2xl font-extrabold text-amber-700 mt-1">
                    ~{queueData.estimatedWaitMinutes} mins
                  </div>
                  <span className="text-[11px] text-[#43566C]">Automated queue prediction</span>
                </div>
              </div>

              <div className="mt-6 p-3.5 rounded-xl bg-[#DFEFEC] border border-[#159B94]/30 flex items-center gap-3 text-xs text-[#20364C]">
                <ShieldCheck className="w-5 h-5 text-[#087F79] shrink-0" />
                <span>You will receive an automated alert when your token is within 2 positions of call-in.</span>
              </div>
            </div>

            {/* Upcoming Appointments List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#20364C] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#087F79]" />
                  Your Scheduled Clinic Visits
                </h3>
                <span className="text-xs text-[#43566C]">{appointments.length} active records</span>
              </div>

              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] shadow-xs hover:border-[#159B94] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#087F79]">{apt.id}</span>
                        <StatusIndicator status={apt.status} />
                        {apt.queueTicket && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/30">
                            Ticket #{apt.queueTicket}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-[#20364C]">{apt.clinic}</h4>
                      <p className="text-xs text-[#43566C]">{apt.facilityName} &bull; {apt.doctorName}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 text-xs text-[#43566C]">
                      <div>
                        <div className="font-bold text-[#20364C]">{apt.date}</div>
                        <div className="text-[#43566C] text-[11px]">{apt.timeSlot}</div>
                      </div>

                      <button
                        onClick={() => alert(`Showing digital confirmation details for ${apt.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#DFEFEC] hover:bg-[#cbe8e2] text-[#087F79] font-bold border border-[#159B94]/30 transition-colors"
                      >
                        View Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REQUEST APPOINTMENT */}
        {activeTab === "book" && (
          <div className="max-w-2xl mx-auto bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-xl font-bold text-[#20364C]">Book Clinic Appointment</h2>
              <p className="text-xs text-[#43566C] mt-1">
                Select your preferred hospital and clinic session. Real-time availability will be validated.
              </p>
            </div>

            {bookingSuccess && (
              <div className="p-4 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#087F79] shrink-0" />
                <span>Appointment booked successfully! Returning to overview...</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  Select Healthcare Facility *
                </label>
                <select
                  value={bookForm.hospital}
                  onChange={(e) => setBookForm({ ...bookForm, hospital: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                >
                  <option value="National Hospital of Sri Lanka (NHSL)">National Hospital of Sri Lanka (NHSL)</option>
                  <option value="Castle Street Hospital for Women">Castle Street Hospital for Women</option>
                  <option value="National Hospital Kandy">National Hospital Kandy</option>
                  <option value="Teaching Hospital Karapitiya">Teaching Hospital Karapitiya</option>
                  <option value="Teaching Hospital Jaffna">Teaching Hospital Jaffna</option>
                  <option value="Base Hospital Kinniya">Base Hospital Kinniya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  Clinic Specialty *
                </label>
                <select
                  value={bookForm.clinic}
                  onChange={(e) => setBookForm({ ...bookForm, clinic: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                >
                  <option value="Cardiology Clinic">Cardiology Clinic</option>
                  <option value="General Outpatient Department (OPD)">General Outpatient Department (OPD)</option>
                  <option value="Diabetic & Endocrine Clinic">Diabetic &amp; Endocrine Clinic</option>
                  <option value="Orthopedic Clinic">Orthopedic Clinic</option>
                  <option value="Pediatrics Clinic">Pediatrics Clinic</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookForm.date}
                    onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20364C] mb-1">
                    Session Window *
                  </label>
                  <select
                    value={bookForm.timeSlot}
                    onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                  >
                    <option value="Morning Session (08:30 AM - 12:00 PM)">Morning Session (08:30 AM - 12:00 PM)</option>
                    <option value="Afternoon Session (01:00 PM - 04:00 PM)">Afternoon Session (01:00 PM - 04:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20364C] mb-1">
                  Reason for Visit / Prior Clinic Card No. (Optional)
                </label>
                <textarea
                  rows={3}
                  value={bookForm.notes}
                  onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                  placeholder="Routine checkup, medication renewal, or doctor referral..."
                  className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:outline-none focus:ring-2 focus:ring-[#159B94]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Confirm Appointment Request
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: VISIT RECORDS & PRESCRIPTIONS */}
        {activeTab === "history" && (
          <div className="bg-[#F8FAFB] border border-[#D9E3E9] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-xl font-bold text-[#20364C]">Clinical Visit Records &amp; Follow-Up Reminders</h2>
              <p className="text-xs text-[#43566C] mt-1">
                Authorized documentation provided by your consulting healthcare practitioners.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#087F79]">Visit #SL-VIS-9418</span>
                  <span className="text-xs text-[#43566C]">18 Sept 2026</span>
                </div>
                <h4 className="text-sm font-bold text-[#20364C]">Consultation with Dr. Samantha Senanayake (Cardiology)</h4>
                <p className="text-xs text-[#364A5D] leading-relaxed">
                  Patient vitals stable (BP 125/82 mmHg, Pulse 74 bpm). Continued current maintenance regimen. Recommended follow-up ECG in 4 weeks.
                </p>
                <div className="flex items-center gap-3 pt-2 text-[11px] text-[#087F79] border-t border-[#D9E3E9]">
                  <span className="flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#087F79]" />
                    Medication Dispensed (Hospital Pharmacy Counter 2)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
