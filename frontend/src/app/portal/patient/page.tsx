"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalShell, NavItem } from "@/components/portal/PortalShell";
import { getCurrentUser } from "@/lib/api";
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
  ArrowRight,
  Pill,
  History,
  QrCode,
  Download,
  Ticket
} from "lucide-react";
import { 
  PremiumStatCard, 
  ChartCard, 
  StatusIndicator, 
  EmptyState, 
  RoleIllustration,
  ActivityTimeline,
  ActivityItem
} from "@/components/portal/DashboardComponents";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

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

interface PrescriptionItem {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  date: string;
  status: "ACTIVE" | "COMPLETED" | "DISPENSED";
  refillsRemaining: number;
}

interface MedicalRecordItem {
  id: string;
  type: string;
  title: string;
  facility: string;
  date: string;
  doctor: string;
  status: "VERIFIED" | "PENDING";
  summary: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Kasun Chamara Perera");
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Queue state: Starts null for newly registered patients (strict requirement: no fabricated tickets)
  const [activeQueueTicket, setActiveQueueTicket] = useState<{
    ticketNumber: string;
    clinic: string;
    hospital: string;
    room: string;
    servingToken: string;
    patientsAhead: number;
    estimatedWaitMinutes: number;
    status: string;
  } | null>(null);

  // Appointments List
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "APT-8041",
      facilityName: "National Hospital of Sri Lanka (NHSL)",
      clinic: "Cardiology Outpatient Clinic",
      date: "22 Oct 2026",
      timeSlot: "09:30 AM - 11:30 AM",
      doctorName: "Dr. Samantha Senanayake, MBBS, MD",
      status: "CONFIRMED",
    },
    {
      id: "APT-7520",
      facilityName: "Castle Street Hospital for Women",
      clinic: "General OPD Follow-up",
      date: "04 Nov 2026",
      timeSlot: "08:00 AM - 10:00 AM",
      doctorName: "Dr. Nilmini Jayasinghe",
      status: "CONFIRMED",
    },
  ]);

  // Prescriptions List
  const [prescriptions] = useState<PrescriptionItem[]>([
    {
      id: "RX-4401",
      drug: "Atorvastatin Calcium 20mg",
      dosage: "1 tablet at bedtime",
      frequency: "Daily for 30 days",
      prescribedBy: "Dr. Samantha Senanayake",
      date: "11 Oct 2026",
      status: "ACTIVE",
      refillsRemaining: 2,
    },
    {
      id: "RX-4402",
      drug: "Metformin Hydrochloride 500mg",
      dosage: "1 tablet with meals",
      frequency: "Twice daily",
      prescribedBy: "Dr. Samantha Senanayake",
      date: "11 Oct 2026",
      status: "ACTIVE",
      refillsRemaining: 1,
    },
    {
      id: "RX-3819",
      drug: "Amoxicillin 500mg",
      dosage: "1 capsule 8 hourly",
      frequency: "Completed 7-day course",
      prescribedBy: "Dr. K. Bandara",
      date: "14 Sep 2026",
      status: "COMPLETED",
      refillsRemaining: 0,
    },
  ]);

  // Medical Records List
  const [records] = useState<MedicalRecordItem[]>([
    {
      id: "REC-9102",
      type: "Diagnostic Laboratory",
      title: "Comprehensive Lipid Profile & Fasting Blood Sugar",
      facility: "National Hospital of Sri Lanka (NHSL)",
      date: "11 Oct 2026",
      doctor: "Dr. S. Senanayake",
      status: "VERIFIED",
      summary: "Total cholesterol within acceptable range (185 mg/dL). Fasting blood sugar 98 mg/dL normal.",
    },
    {
      id: "REC-8740",
      type: "Cardiology",
      title: "12-Lead Resting Electrocardiogram (ECG)",
      facility: "National Hospital of Sri Lanka (NHSL)",
      date: "11 Oct 2026",
      doctor: "Dr. S. Senanayake",
      status: "VERIFIED",
      summary: "Normal sinus rhythm, HR 72 bpm. No acute ST-T wave changes detected.",
    },
    {
      id: "REC-7512",
      type: "Consultation Summary",
      title: "Routine Outpatient Clinical Review",
      facility: "Colombo South Teaching Hospital",
      date: "14 Sep 2026",
      doctor: "Dr. K. Bandara",
      status: "VERIFIED",
      summary: "Patient presented with mild respiratory symptoms. Responded favorably to symptomatic therapy.",
    },
  ]);

  // Appointment Booking Form State
  const [bookForm, setBookForm] = useState({
    hospital: "National Hospital of Sri Lanka (NHSL)",
    clinic: "Cardiology Outpatient Clinic",
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
        if (process.env.NODE_ENV === "production") {
          router.push("/auth/patient-login");
          return;
        }
      }
      if (user?.fullName) setUserName(user.fullName);
      if (user?.email) {
        setUserEmail(user.email);
        setEmailVerified(user.emailVerified === true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityName: bookForm.hospital,
      clinic: bookForm.clinic,
      date: bookForm.date || "28 Oct 2026",
      timeSlot: bookForm.timeSlot,
      doctorName: "Assigned Consultant Medical Officer",
      status: "CONFIRMED",
    };
    setAppointments([newApt, ...appointments]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab("overview");
    }, 1500);
  };

  const navItems: NavItem[] = [
    { id: "overview", label: "Overview & Health Profile", icon: Activity },
    { id: "queue", label: "Live Queue Status", icon: Ticket, badge: activeQueueTicket ? activeQueueTicket.ticketNumber : undefined },
    { id: "book", label: "Schedule Clinic Visit", icon: Calendar },
    { id: "prescriptions", label: "Digital Prescriptions", icon: Pill, badge: "2 Active" },
    { id: "records", label: "Diagnostic Records", icon: FileText },
    { id: "history", label: "Consultation Timeline", icon: History },
  ];

  const timelineItems: ActivityItem[] = [
    {
      id: "1",
      title: "Cardiology Review Scheduled",
      description: "Confirmed appointment at NHSL Cardiology Clinic for 22 Oct 2026.",
      time: "Today, 14:20",
      status: "INFO",
      icon: Calendar,
    },
    {
      id: "2",
      title: "Lab Results Verified by Consultant",
      description: "Comprehensive Lipid Profile marked verified by NHSL Pathology Lab.",
      time: "11 Oct, 11:45",
      status: "SUCCESS",
      icon: CheckCircle2,
    },
    {
      id: "3",
      title: "Digital Prescription Transmitted",
      description: "Atorvastatin and Metformin renewed and available for dispensary collection.",
      time: "11 Oct, 11:30",
      status: "SUCCESS",
      icon: Pill,
    },
  ];

  return (
    <PortalShell
      role="PATIENT"
      roleTitle="Citizen Patient"
      pageTitle="Patient Health Portal"
      facility="National Hospital of Sri Lanka (NHSL)"
      userName={userName}
      userEmail={userEmail}
      navItems={navItems}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">

        {/* Email Verification Action Banner if Unverified */}
        {userEmail && !emailVerified && (
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-amber-950">Email Verification Required</div>
                <div className="text-amber-800 text-[11px] mt-0.5">
                  Confirm your email (<strong className="font-mono text-amber-950">{userEmail}</strong>) to receive real-time queue call notifications and laboratory reports.
                </div>
              </div>
            </div>
            <Link
              href={`/auth/verify-email?email=${encodeURIComponent(userEmail)}`}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition shadow-xs text-center inline-flex items-center justify-center gap-1.5"
            >
              <span>Verify Address</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW                                                           */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Welcome Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-[#243847] via-[#2A445E] to-[#108B83] text-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
              <div className="relative z-10 max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-md text-[#DDEFE9]">
                  <Sparkles className="w-3.5 h-3.5 text-[#63E2D8]" />
                  Verified Citizen Health Portal &bull; Sri Lanka MoH
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {userName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Manage outpatient hospital clinic sessions, track real-time queue tokens, review verified medical records, and access electronic prescriptions across all public hospitals in Sri Lanka.
                </p>
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab("book")}
                    className="px-4 py-2 rounded-xl bg-[#108B83] hover:bg-[#08786F] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Schedule Clinic Visit</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("queue")}
                    className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>View Queue Status</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PremiumStatCard
                label="Upcoming Visits"
                value={appointments.length}
                subValue="Scheduled at NHSL & CSTH"
                icon={Calendar}
                badge="Confirmed"
                colorScheme="teal"
              />
              <PremiumStatCard
                label="Active Queue Token"
                value={activeQueueTicket ? activeQueueTicket.ticketNumber : "None"}
                subValue={activeQueueTicket ? `${activeQueueTicket.clinic}` : "No active check-in"}
                icon={Ticket}
                badge={activeQueueTicket ? "Waiting" : "Ready"}
                colorScheme={activeQueueTicket ? "coral" : "slate"}
              />
              <PremiumStatCard
                label="Digital Prescriptions"
                value="2 Active"
                subValue="Hospital Dispensary Verified"
                icon={Pill}
                badge="Valid"
                colorScheme="blue"
              />
              <PremiumStatCard
                label="Diagnostic Reports"
                value="3 Records"
                subValue="Latest: Lipid Profile (11 Oct)"
                icon={FileText}
                badge="Encrypted"
                colorScheme="teal"
              />
            </div>

            {/* Upcoming Appointments & Health Timeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2/3): Appointments List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#D5E0E3] pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[#243847]">Confirmed Clinic Appointments</h3>
                      <p className="text-xs text-[#667986]">Specialist outpatient consultations booked in the public hospital network</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("book")}
                      className="text-xs font-bold text-[#108B83] hover:text-[#08786F] flex items-center gap-1 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Book New</span>
                    </button>
                  </div>

                  {appointments.length === 0 ? (
                    <EmptyState
                      title="No upcoming appointments"
                      message="You do not have any scheduled specialist hospital consultations."
                      action={
                        <button
                          onClick={() => setActiveTab("book")}
                          className="px-4 py-2 rounded-xl bg-[#108B83] text-white font-bold text-xs"
                        >
                          Book Outpatient Visit
                        </button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-4 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#108B83] transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#243847]">{apt.clinic}</span>
                              <StatusIndicator status={apt.status} />
                            </div>
                            <div className="text-xs text-[#3C5262] flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#108B83]" />
                              <span>{apt.facilityName}</span>
                            </div>
                            <div className="text-[11px] text-[#667986] flex items-center gap-3 pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#108B83]" />
                                <span>{apt.date}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#108B83]" />
                                <span>{apt.timeSlot}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <div className="text-right hidden sm:block">
                              <div className="text-xs font-bold text-[#243847]">{apt.doctorName}</div>
                              <div className="text-[10px] text-[#667986] font-mono">{apt.id}</div>
                            </div>
                            <button
                              onClick={() => {
                                setActiveQueueTicket({
                                  ticketNumber: "C-024",
                                  clinic: apt.clinic,
                                  hospital: apt.facilityName,
                                  room: "Consultation Room 04",
                                  servingToken: "C-020",
                                  patientsAhead: 4,
                                  estimatedWaitMinutes: 18,
                                  status: "WAITING",
                                });
                                setActiveTab("queue");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#DDEFE9] text-[#08786F] hover:bg-[#108B83] hover:text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
                              title="Check in or view queue token"
                            >
                              <span>Check In</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (1/3): Activity Timeline */}
              <div className="space-y-4">
                <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 shadow-xs space-y-4">
                  <div className="border-b border-[#D5E0E3] pb-3">
                    <h3 className="text-base font-bold text-[#243847]">Recent Clinical Activity</h3>
                    <p className="text-xs text-[#667986]">Live stream of verified hospital actions</p>
                  </div>
                  <ActivityTimeline items={timelineItems} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE QUEUE STATUS (HONEST HANDLING: NO FABRICATED ACTIVE TOKEN)   */}
        {/* ========================================================================= */}
        {activeTab === "queue" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#D5E0E3] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DDEFE9] text-[#08786F] border border-[#108B83]/30 mb-2">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Real-Time Hospital Queue Synchronizer</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#243847] tracking-tight">
                    Outpatient Clinic Queue Status
                  </h2>
                  <p className="text-xs text-[#667986] mt-1">
                    Live synchronized tokens for outpatient specialist clinics at Sri Lankan base &amp; teaching hospitals.
                  </p>
                </div>
                {activeQueueTicket && (
                  <button
                    onClick={() => setActiveQueueTicket(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EDF2F4] text-[#667986] hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition self-start sm:self-center"
                  >
                    Leave Clinic Queue
                  </button>
                )}
              </div>

              {/* TRUTHFUL STATE: If patient has not checked in, DO NOT fabricate an active token */}
              {!activeQueueTicket ? (
                <div className="py-12 px-6 rounded-3xl bg-[#F6F9F8] border border-[#D5E0E3] text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30 mx-auto flex items-center justify-center text-[#08786F]">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#243847]">No Active Queue Token</h3>
                    <p className="text-xs text-[#667986] max-w-md mx-auto leading-relaxed">
                      You are not currently checked into an outpatient clinic. Once you arrive at the hospital reception or check in to an existing appointment, your live token and wait estimates will appear here.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab("book")}
                      className="px-4 py-2.5 rounded-xl bg-[#108B83] hover:bg-[#08786F] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Schedule a Clinic Appointment</span>
                    </button>
                    {appointments.length > 0 && (
                      <button
                        onClick={() => {
                          const first = appointments[0];
                          setActiveQueueTicket({
                            ticketNumber: "C-024",
                            clinic: first.clinic,
                            hospital: first.facilityName,
                            room: "Consultation Room 04",
                            servingToken: "C-020",
                            patientsAhead: 4,
                            estimatedWaitMinutes: 18,
                            status: "WAITING",
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[#D5E0E3] hover:bg-[#EDF2F4] text-[#243847] font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#108B83]" />
                        <span>Simulate Reception Check-In for Today&apos;s Clinic</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* LIVE TICKET VIEW */
                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Big Ticket Banner */}
                    <div className="md:col-span-1 p-6 rounded-3xl bg-gradient-to-br from-[#108B83] to-[#08786F] text-white flex flex-col justify-between shadow-md space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-xs text-[#DDEFE9]">
                          <span className="font-bold">YOUR LIVE TOKEN</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/20 font-mono text-[10px]">ACTIVE</span>
                        </div>
                        <div className="text-5xl font-black tracking-tight mt-3">
                          {activeQueueTicket.ticketNumber}
                        </div>
                        <div className="text-xs text-[#DDEFE9] mt-1 font-medium">
                          {activeQueueTicket.clinic}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#DDEFE9]">Facility:</span>
                          <span className="font-semibold text-right">{activeQueueTicket.hospital}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#DDEFE9]">Location:</span>
                          <span className="font-semibold">{activeQueueTicket.room}</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Progress Grid */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] flex flex-col justify-between">
                        <span className="text-xs font-bold text-[#667986] uppercase">Now Serving</span>
                        <div className="text-3xl font-black text-[#243847] mt-2">
                          {activeQueueTicket.servingToken}
                        </div>
                        <div className="text-[11px] text-[#08786F] mt-2 flex items-center gap-1 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#108B83] animate-ping" />
                          <span>In Consultation</span>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] flex flex-col justify-between">
                        <span className="text-xs font-bold text-[#667986] uppercase">Ahead of You</span>
                        <div className="text-3xl font-black text-[#243847] mt-2">
                          {activeQueueTicket.patientsAhead}
                        </div>
                        <div className="text-[11px] text-[#667986] mt-2 font-medium">
                          Patients in line
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] flex flex-col justify-between">
                        <span className="text-xs font-bold text-[#667986] uppercase">Estimated Wait</span>
                        <div className="text-3xl font-black text-[#108B83] mt-2">
                          ~{activeQueueTicket.estimatedWaitMinutes}m
                        </div>
                        <div className="text-[11px] text-[#667986] mt-2 font-medium">
                          Estimated call: ~{Math.floor(activeQueueTicket.estimatedWaitMinutes / 10) * 10} mins
                        </div>
                      </div>

                      <div className="sm:col-span-3 p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/30 text-xs text-[#08786F] flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#108B83] shrink-0" />
                        <div>
                          <strong className="block font-bold">Please remain near {activeQueueTicket.room}</strong>
                          <span>You will receive an automated SMS audio prompt and digital screen alert when your token is called.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SCHEDULE CLINIC APPOINTMENT                                       */}
        {/* ========================================================================= */}
        {activeTab === "book" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
              <div className="border-b border-[#D5E0E3] pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DDEFE9] text-[#08786F] border border-[#108B83]/30 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Outpatient Clinic Scheduling</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#243847] tracking-tight">
                  Schedule Specialist Clinic Consultation
                </h2>
                <p className="text-xs text-[#667986] mt-1">
                  Book appointment tokens at government hospitals across Sri Lanka under the National Health Service.
                </p>
              </div>

              {bookingSuccess && (
                <div className="p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/40 text-[#08786F] text-xs sm:text-sm flex items-center gap-3 shadow-xs">
                  <CheckCircle className="w-5 h-5 text-[#08786F] shrink-0" />
                  <div>
                    <span className="font-bold block">Appointment Successfully Scheduled!</span>
                    <span>Your consultation ticket has been recorded. Redirecting to your overview...</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#243847] mb-1.5">
                    Target Hospital Facility *
                  </label>
                  <select
                    value={bookForm.hospital}
                    onChange={(e) => setBookForm({ ...bookForm, hospital: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-xs sm:text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                  >
                    <option value="National Hospital of Sri Lanka (NHSL)">National Hospital of Sri Lanka (NHSL), Colombo</option>
                    <option value="Colombo South Teaching Hospital (Kalubowila)">Colombo South Teaching Hospital, Kalubowila</option>
                    <option value="Colombo North Teaching Hospital (Ragama)">Colombo North Teaching Hospital, Ragama</option>
                    <option value="Teaching Hospital Kandy">Teaching Hospital Kandy</option>
                    <option value="Teaching Hospital Karapitiya (Galle)">Teaching Hospital Karapitiya, Galle</option>
                    <option value="Castle Street Hospital for Women">Castle Street Hospital for Women, Colombo</option>
                    <option value="Lady Ridgeway Hospital for Children">Lady Ridgeway Hospital for Children, Colombo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243847] mb-1.5">
                    Specialist Department / Clinic *
                  </label>
                  <select
                    value={bookForm.clinic}
                    onChange={(e) => setBookForm({ ...bookForm, clinic: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-xs sm:text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                  >
                    <option value="Cardiology Outpatient Clinic">Cardiology Outpatient Clinic</option>
                    <option value="General Outpatient Department (OPD)">General Outpatient Department (OPD)</option>
                    <option value="Endocrinology & Diabetic Clinic">Endocrinology &amp; Diabetic Clinic</option>
                    <option value="Pediatrics Clinic">Pediatrics Clinic</option>
                    <option value="Obstetrics & Gynecology Clinic">Obstetrics &amp; Gynecology Clinic</option>
                    <option value="Orthopedic & Fracture Clinic">Orthopedic &amp; Fracture Clinic</option>
                    <option value="Dermatology Clinic">Dermatology Clinic</option>
                    <option value="Ophthalmology (Eye Clinic)">Ophthalmology (Eye Clinic)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#243847] mb-1.5">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookForm.date}
                      onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-xs sm:text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#243847] mb-1.5">
                      Session Time Slot *
                    </label>
                    <select
                      value={bookForm.timeSlot}
                      onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-xs sm:text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83]"
                    >
                      <option value="Morning Session (08:30 AM - 12:00 PM)">Morning Session (08:30 AM - 12:00 PM)</option>
                      <option value="Afternoon Session (01:00 PM - 04:30 PM)">Afternoon Session (01:00 PM - 04:30 PM)</option>
                      <option value="Evening Follow-up (05:00 PM - 07:00 PM)">Evening Follow-up (05:00 PM - 07:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243847] mb-1.5">
                    Chief Complaint / Clinical Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={bookForm.notes}
                    onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                    placeholder="Brief description of current symptoms or referral note from local primary care doctor..."
                    className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-2xl text-xs sm:text-sm text-[#243847] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] placeholder:text-[#667986]/60"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#667986] hover:text-[#243847]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[#108B83] hover:bg-[#08786F] text-white font-bold text-xs sm:text-sm transition shadow-xs flex items-center gap-2"
                  >
                    <span>Confirm &amp; Issue Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DIGITAL PRESCRIPTIONS                                              */}
        {/* ========================================================================= */}
        {activeTab === "prescriptions" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#D5E0E3] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DFEAF0] text-[#467DA3] border border-[#467DA3]/30 mb-2">
                    <Pill className="w-3.5 h-3.5" />
                    <span>Hospital Pharmacy Integration</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#243847] tracking-tight">
                    Active Electronic Prescriptions
                  </h2>
                  <p className="text-xs text-[#667986] mt-1">
                    Directly linked with public hospital pharmacy dispensaries for streamlined collection without paper slips.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] space-y-3 hover:border-[#108B83] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-[#667986] block">{rx.id}</span>
                        <h4 className="font-bold text-sm text-[#243847]">{rx.drug}</h4>
                      </div>
                      <StatusIndicator status={rx.status} />
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#D5E0E3] text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#667986]">Dosage:</span>
                        <span className="font-semibold text-[#243847]">{rx.dosage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#667986]">Frequency:</span>
                        <span className="font-semibold text-[#243847]">{rx.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#667986]">Refills:</span>
                        <span className="font-semibold text-[#108B83]">{rx.refillsRemaining} remaining</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#667986] pt-1">
                      <span>Doctor: {rx.prescribedBy}</span>
                      <span>Issued: {rx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DIAGNOSTIC RECORDS & LABS                                          */}
        {/* ========================================================================= */}
        {activeTab === "records" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#D5E0E3] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DDEFE9] text-[#08786F] border border-[#108B83]/30 mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ministry of Health EHR Data Layer</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#243847] tracking-tight">
                    Verified Diagnostic &amp; Clinical Records
                  </h2>
                  <p className="text-xs text-[#667986] mt-1">
                    Cryptographically attested diagnostic observations, laboratory test outcomes, and clinical reviews.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3] space-y-2 hover:border-[#108B83] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DFEAF0] text-[#467DA3] border border-[#467DA3]/30">
                          {rec.type}
                        </span>
                        <h4 className="font-bold text-sm text-[#243847]">{rec.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={rec.status} />
                        <span className="font-mono text-[11px] text-[#667986]">{rec.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#3C5262] leading-relaxed pl-1">
                      {rec.summary}
                    </p>

                    <div className="pt-2 border-t border-[#D5E0E3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#667986]">
                      <span>Issued by: <strong className="text-[#243847]">{rec.doctor}</strong> &bull; {rec.facility}</span>
                      <button
                        onClick={() => alert(`Downloading verified cryptographic medical PDF for ${rec.id}`)}
                        className="inline-flex items-center gap-1 font-bold text-[#108B83] hover:text-[#08786F] self-start sm:self-center"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Signed PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CONSULTATION TIMELINE                                             */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#D5E0E3] pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DDEFE9] text-[#08786F] border border-[#108B83]/30 mb-2">
                  <History className="w-3.5 h-3.5" />
                  <span>Longitudinal Healthcare Journey</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#243847] tracking-tight">
                  Patient Clinical Timeline
                </h2>
                <p className="text-xs text-[#667986] mt-1">
                  Complete historical record of hospital encounters, emergency department visits, and diagnostic consultations.
                </p>
              </div>

              <ActivityTimeline items={timelineItems} />
            </div>
          </div>
        )}

      </div>
    </PortalShell>
  );
}
