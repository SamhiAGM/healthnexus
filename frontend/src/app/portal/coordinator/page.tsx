"use client";

import React, { useState, useEffect } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { 
  CalendarDays, 
  Users, 
  Clock, 
  DoorOpen, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Plus, 
  Activity, 
  TrendingUp, 
  SlidersHorizontal,
  Layers
} from "lucide-react";

interface SessionItem {
  id: string;
  clinicName: string;
  roomNumber: string;
  assignedDoctor: string;
  dayOfWeek: string;
  timeSlot: string;
  capacity: number;
  bookedCount: number;
  status: "OPEN" | "FULL" | "SUSPENDED" | string;
}

interface WorkloadData {
  totalActiveSessions: number;
  openSessions: number;
  totalCapacitySlots: number;
  totalBookedAppointments: number;
  utilizationRate: number;
  coordinatorFacility: string;
}

export default function ClinicCoordinatorPortalPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [workload, setWorkload] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ROSTER" | "NEW_SESSION">("ROSTER");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states for new session
  const [cName, setCName] = useState("");
  const [cRoom, setCRoom] = useState("");
  const [cDoctor, setCDoctor] = useState("");
  const [cDay, setCDay] = useState("Monday");
  const [cTime, setCTime] = useState("08:30 AM - 12:30 PM");
  const [cCapacity, setCCapacity] = useState(40);

  // Adjust Capacity Modal
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [adjustCapacity, setAdjustCapacity] = useState(40);
  const [adjustStatus, setAdjustStatus] = useState("OPEN");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("hc_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [sessRes, workRes] = await Promise.all([
        fetch("http://localhost:8080/api/coordinator/sessions", { headers }),
        fetch("http://localhost:8080/api/coordinator/workload", { headers })
      ]);

      if (sessRes.ok) setSessions(await sessRes.json());
      if (workRes.ok) setWorkload(await workRes.json());
    } catch (err) {
      console.error("Failed to load coordinator data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("hc_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/coordinator/sessions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          clinicName: cName,
          roomNumber: cRoom,
          assignedDoctor: cDoctor,
          dayOfWeek: cDay,
          timeSlot: cTime,
          capacity: Number(cCapacity),
          bookedCount: 0,
          status: "OPEN"
        })
      });

      if (res.ok) {
        setActionSuccess(`Clinic session "${cName}" successfully rostered.`);
        setCName("");
        setCRoom("");
        setCDoctor("");
        setActiveTab("ROSTER");
        fetchData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const handleUpdateCapacity = async () => {
    if (!selectedSession) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("hc_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/coordinator/sessions/${selectedSession.id}/capacity`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          capacity: Number(adjustCapacity),
          status: adjustStatus
        })
      });

      if (res.ok) {
        setActionSuccess(`Capacity for ${selectedSession.clinicName} updated to ${adjustCapacity} (${adjustStatus}).`);
        setSelectedSession(null);
        fetchData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Error updating capacity:", err);
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assignedDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.dayOfWeek.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalShell
      role="CLINIC_COORDINATOR"
      pageTitle="Outpatient Clinic Operations & Coordination"
      breadcrumbs={[{ label: "Portal", href: "/portal/coordinator" }, { label: "Scheduling" }]}
    >
      <div className="space-y-6">
        {/* Banner Alert for Demo */}
        <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl">
          <div className="flex items-center space-x-3">
            <CalendarDays className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <p className="text-sm font-medium text-teal-900 dark:text-teal-200">
              Live Session Dispatch: {workload?.coordinatorFacility || "National Hospital of Sri Lanka (NHSL)"}
            </p>
          </div>
          <span className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded-full font-semibold">
            Clinical Rostering Active
          </span>
        </div>

        {/* Action success message */}
        {actionSuccess && (
          <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Workload Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Clinics</span>
              <Activity className="w-5 h-5 text-teal-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {workload ? workload.totalActiveSessions : sessions.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {workload ? `${workload.openSessions} sessions open for booking` : "Roster active"}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booked Queue</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {workload ? workload.totalBookedAppointments : sessions.reduce((acc, s) => acc + s.bookedCount, 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Citizens queued for consultation</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Slot Capacity</span>
              <DoorOpen className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {workload ? workload.totalCapacitySlots : sessions.reduce((acc, s) => acc + s.capacity, 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Available consultation capacity</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity Utilization</span>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {workload ? `${workload.utilizationRate}%` : "64.2%"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Appointment intake ratio</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("ROSTER")}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === "ROSTER"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Clinic Session Roster</span>
          </button>
          <button
            onClick={() => setActiveTab("NEW_SESSION")}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === "NEW_SESSION"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Clinic Session</span>
          </button>
        </div>

        {/* Tab 1: Roster */}
        {activeTab === "ROSTER" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search clinic, doctor, room or day..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Refresh Roster"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Clinic & Room</th>
                    <th className="px-5 py-3">Specialist Doctor</th>
                    <th className="px-5 py-3">Schedule Slot</th>
                    <th className="px-5 py-3">Capacity Intake</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        {loading ? "Loading session roster..." : "No clinic sessions match your query."}
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((s) => {
                      const perc = s.capacity > 0 ? Math.round((s.bookedCount / s.capacity) * 100) : 0;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {s.clinicName}
                            </div>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                              {s.roomNumber}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                            {s.assignedDoctor}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900 dark:text-white">{s.dayOfWeek}</div>
                            <div className="text-xs text-slate-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{s.timeSlot}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 w-44">
                            <div className="text-xs font-medium mb-1">
                              <span className="text-slate-900 dark:text-white font-semibold">{s.bookedCount}</span>
                              <span className="text-slate-400"> / {s.capacity} slots</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  perc >= 100 ? "bg-rose-500" : perc >= 70 ? "bg-amber-500" : "bg-teal-500"
                                }`}
                                style={{ width: `${Math.min(perc, 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              s.status === "OPEN"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : s.status === "FULL"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedSession(s);
                                setAdjustCapacity(s.capacity);
                                setAdjustStatus(s.status);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ml-auto"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Adjust</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: New Session Form */}
        {activeTab === "NEW_SESSION" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Roster New Clinic Session
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Assign physician consultation hours, room allocation, and booking limits.
            </p>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Clinic Specialism / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dermatology Specialist Clinic"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 07 (OPD Wing)"
                    value={cRoom}
                    onChange={(e) => setCRoom(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Doctor / Consultant
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. H. Jayasinghe, MD"
                    value={cDoctor}
                    onChange={(e) => setCDoctor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Day of Week
                  </label>
                  <select
                    value={cDay}
                    onChange={(e) => setCDay(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Slot Time Window
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 AM - 12:30 PM"
                    value={cTime}
                    onChange={(e) => setCTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Maximum Appointment Slot Capacity
                </label>
                <input
                  type="number"
                  min="5"
                  required
                  value={cCapacity}
                  onChange={(e) => setCCapacity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("ROSTER")}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Confirm & Roster Session
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Adjust Capacity Modal */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Adjust Clinic Capacity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Modify slots and availability for <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSession.clinicName}</span> ({selectedSession.roomNumber}).
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Max Capacity Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adjustCapacity}
                    onChange={(e) => setAdjustCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Session Status
                  </label>
                  <select
                    value={adjustStatus}
                    onChange={(e) => setAdjustStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  >
                    <option value="OPEN">OPEN (Accepting Bookings)</option>
                    <option value="FULL">FULL (Capacity Reached)</option>
                    <option value="SUSPENDED">SUSPENDED (Doctor Unavailable)</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSession(null)}
                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateCapacity}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
