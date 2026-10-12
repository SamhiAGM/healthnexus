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
  Stethoscope
} from "lucide-react";

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
  const [userName, setUserName] = useState("Kasun Chamara");
  const [activeTab, setActiveTab] = useState<"overview" | "book" | "history">("overview");

  // Live Queue Ticket State (Demonstration of live hospital queue tracker)
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
    <div className="min-h-screen bg-[#081225] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Patient Header */}
      <header className="bg-[#0B1730] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="light" size="sm" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950/60 text-teal-400 border border-teal-800/40">
              Patient Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-white leading-tight">{userName}</div>
                <div className="text-slate-400 text-[10px]">NIC Verified Citizen</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "overview"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              My Care & Live Queue
            </button>
            <button
              onClick={() => setActiveTab("book")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "book"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Request Appointment
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "history"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Visit Records
            </button>
          </div>

          <button
            onClick={() => setActiveTab("book")}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Booking
          </button>
        </div>

        {/* TAB 1: OVERVIEW & LIVE QUEUE TRACKER */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in-50 duration-200">
            
            {/* Live Queue Ticket Card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0F1E36] to-[#0A162B] border border-teal-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    Active Live Queue Ticket
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {queueData.clinic}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    {queueData.hospital} • {queueData.room}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-6 py-4 rounded-2xl">
                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Your Token</div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-teal-400">
                      {queueData.ticketNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Flow Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-xs text-slate-400">Current Token Serving</span>
                  <div className="text-2xl font-bold text-white mt-1">{queueData.servingToken}</div>
                  <span className="text-[11px] text-teal-400">Consultation In Progress</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-xs text-slate-400">Patients Ahead of You</span>
                  <div className="text-2xl font-bold text-white mt-1">{queueData.patientsAhead}</div>
                  <span className="text-[11px] text-blue-400">Steady clinic flow</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-xs text-slate-400">Estimated Waiting Time</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    ~{queueData.estimatedWaitMinutes} mins
                  </div>
                  <span className="text-[11px] text-slate-400">Automated queue prediction</span>
                </div>
              </div>

              <div className="mt-6 p-3.5 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                <span>You will receive an automated alert when your token is within 2 positions of call-in.</span>
              </div>
            </div>

            {/* Upcoming Appointments List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  Your Scheduled Clinic Visits
                </h3>
                <span className="text-xs text-slate-400">{appointments.length} active records</span>
              </div>

              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-700/70 hover:border-teal-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-400">{apt.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          {apt.status}
                        </span>
                        {apt.queueTicket && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950/60 text-teal-400 border border-teal-800/40">
                            Ticket #{apt.queueTicket}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white">{apt.clinic}</h4>
                      <p className="text-xs text-slate-400">{apt.facilityName} • {apt.doctorName}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 text-xs text-slate-300">
                      <div>
                        <div className="font-semibold text-white">{apt.date}</div>
                        <div className="text-slate-400 text-[11px]">{apt.timeSlot}</div>
                      </div>

                      <button
                        onClick={() => alert(`Showing digital confirmation details for ${apt.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold border border-slate-700 transition-colors"
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
          <div className="max-w-2xl mx-auto bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Book Clinic Appointment</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your preferred hospital and clinic session. Real-time availability will be validated.
              </p>
            </div>

            {bookingSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Appointment booked successfully! Returning to overview...</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Healthcare Facility *
                </label>
                <select
                  value={bookForm.hospital}
                  onChange={(e) => setBookForm({ ...bookForm, hospital: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="National Hospital of Sri Lanka (NHSL)">National Hospital of Sri Lanka (NHSL)</option>
                  <option value="Castle Street Hospital for Women">Castle Street Hospital for Women</option>
                  <option value="National Hospital Kandy">National Hospital Kandy</option>
                  <option value="Teaching Hospital Karapitiya">Teaching Hospital Karapitiya</option>
                  <option value="Teaching Hospital Jaffna">Teaching Hospital Jaffna</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinic Specialty *
                </label>
                <select
                  value={bookForm.clinic}
                  onChange={(e) => setBookForm({ ...bookForm, clinic: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Cardiology Clinic">Cardiology Clinic</option>
                  <option value="General Outpatient Department (OPD)">General Outpatient Department (OPD)</option>
                  <option value="Diabetic & Endocrine Clinic">Diabetic & Endocrine Clinic</option>
                  <option value="Orthopedic Clinic">Orthopedic Clinic</option>
                  <option value="Pediatrics Clinic">Pediatrics Clinic</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookForm.date}
                    onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Session Window *
                  </label>
                  <select
                    value={bookForm.timeSlot}
                    onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Morning Session (08:30 AM - 12:00 PM)">Morning Session (08:30 AM - 12:00 PM)</option>
                    <option value="Afternoon Session (01:00 PM - 04:00 PM)">Afternoon Session (01:00 PM - 04:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Visit / Prior Clinic Card No. (Optional)
                </label>
                <textarea
                  rows={3}
                  value={bookForm.notes}
                  onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                  placeholder="Routine checkup, medication renewal, or doctor referral..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Confirm Appointment Request
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: VISIT RECORDS & PRESCRIPTIONS */}
        {activeTab === "history" && (
          <div className="bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Clinical Visit Records & Follow-Up Reminders</h2>
              <p className="text-xs text-slate-400 mt-1">
                Authorized documentation provided by your consulting healthcare practitioners.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">Visit #SL-VIS-9418</span>
                  <span className="text-xs text-slate-400">18 Sept 2026</span>
                </div>
                <h4 className="text-sm font-bold text-white">Consultation with Dr. Samantha Senanayake (Cardiology)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Patient vitals stable (BP 125/82 mmHg, Pulse 74 bpm). Continued current maintenance regimen. Recommended follow-up ECG in 4 weeks.
                </p>
                <div className="flex items-center gap-3 pt-2 text-[11px] text-teal-400 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Medication Dispensed (Hospital Pharmacy Counter 2)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
