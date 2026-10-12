"use client";

import React, { useState, useEffect } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { 
  Building2, 
  Users, 
  Bed, 
  Megaphone, 
  Plus, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Layers,
  ShieldAlert
} from "lucide-react";

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  totalStaff: number;
  bedCapacity: number;
  occupiedBeds: number;
  status: "OPERATIONAL" | "HIGH_DEMAND" | "UNDER_MAINTENANCE" | string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  department: string;
  priority: "ROUTINE" | "URGENT" | "CRITICAL" | string;
  authorName: string;
  createdAt?: string;
}

interface OperationalOverview {
  totalDepartments: number;
  activeDepartments: number;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRatePercentage: number;
  totalStaffDeployed: number;
  facilityName: string;
}

export default function HospitalAdminPortalPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [overview, setOverview] = useState<OperationalOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"DEPARTMENTS" | "BROADCASTS" | "NEW_DEPT">("DEPARTMENTS");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Department Form
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptHOD, setDeptHOD] = useState("");
  const [deptStaff, setDeptStaff] = useState(25);
  const [deptBeds, setDeptBeds] = useState(30);

  // New Broadcast Form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annDept, setAnnDept] = useState("ALL");
  const [annPriority, setAnnPriority] = useState("ROUTINE");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("hc_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [deptRes, annRes, overRes] = await Promise.all([
        fetch("http://localhost:8080/api/hospital-admin/departments", { headers }),
        fetch("http://localhost:8080/api/hospital-admin/announcements", { headers }),
        fetch("http://localhost:8080/api/hospital-admin/overview", { headers })
      ]);

      if (deptRes.ok) setDepartments(await deptRes.json());
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (overRes.ok) setOverview(await overRes.json());
    } catch (err) {
      console.error("Failed to load hospital admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("hc_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/hospital-admin/departments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: deptName,
          code: deptCode,
          headOfDepartment: deptHOD,
          totalStaff: Number(deptStaff),
          bedCapacity: Number(deptBeds),
          occupiedBeds: 0,
          status: "OPERATIONAL"
        })
      });

      if (res.ok) {
        setActionSuccess(`Department "${deptName}" successfully registered.`);
        setDeptName("");
        setDeptCode("");
        setDeptHOD("");
        setActiveTab("DEPARTMENTS");
        fetchData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Error creating department:", err);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("hc_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/hospital-admin/announcements", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          department: annDept,
          priority: annPriority,
          authorName: "Hospital Directorate"
        })
      });

      if (res.ok) {
        setActionSuccess(`Internal broadcast published across ${annDept} units.`);
        setAnnTitle("");
        setAnnContent("");
        fetchData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Error publishing broadcast:", err);
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.headOfDepartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalShell
      role="HOSPITAL_ADMIN"
      pageTitle="Hospital Executive Directorate"
      breadcrumbs={[{ label: "Portal", href: "/portal/hospital-admin" }, { label: "Operations" }]}
    >
      <div className="space-y-6">
        {/* Banner Alert for Demo */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Institutional Operations: {overview?.facilityName || "National Hospital of Sri Lanka (NHSL Colombo)"}
            </p>
          </div>
          <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full font-semibold">
            Executive Admin
          </span>
        </div>

        {/* Action success message */}
        {actionSuccess && (
          <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Operational Overview Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical Units</span>
              <Layers className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overview ? overview.totalDepartments : departments.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {overview ? `${overview.activeDepartments} Active wards/departments` : "All units active"}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Occupancy</span>
              <Bed className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {overview ? `${overview.occupancyRatePercentage}%` : "74.8%"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {overview ? `${overview.occupiedBeds} / ${overview.totalBeds} Inpatient beds occupied` : "Capacity stable"}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medical Staff</span>
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {overview ? overview.totalStaffDeployed : departments.reduce((acc, d) => acc + d.totalStaff, 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Clinicians, nurses & allied staff</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Directives</span>
              <Megaphone className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {announcements.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active hospital-wide notices</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("DEPARTMENTS")}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === "DEPARTMENTS"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departments & Capacity</span>
          </button>
          <button
            onClick={() => setActiveTab("BROADCASTS")}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === "BROADCASTS"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Hospital Broadcasts & Directives</span>
          </button>
          <button
            onClick={() => setActiveTab("NEW_DEPT")}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === "NEW_DEPT"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Clinical Unit</span>
          </button>
        </div>

        {/* Tab 1: Departments */}
        {activeTab === "DEPARTMENTS" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search department, code or Head of Dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Refresh Units"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Unit / Code</th>
                    <th className="px-5 py-3">Head of Department</th>
                    <th className="px-5 py-3">Medical Staff</th>
                    <th className="px-5 py-3">Bed Capacity</th>
                    <th className="px-5 py-3">Occupancy Bar</th>
                    <th className="px-5 py-3 text-right">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDepts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        {loading ? "Loading clinical departments..." : "No departments match search query."}
                      </td>
                    </tr>
                  ) : (
                    filteredDepts.map((d) => {
                      const percentage = d.bedCapacity > 0 ? Math.round((d.occupiedBeds / d.bedCapacity) * 100) : 0;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {d.name}
                            </div>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                              {d.code}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                            {d.headOfDepartment}
                          </td>
                          <td className="px-5 py-4 font-medium">
                            {d.totalStaff} staff
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-900 dark:text-white">{d.occupiedBeds}</span>
                            <span className="text-slate-400"> / {d.bedCapacity} beds</span>
                          </td>
                          <td className="px-5 py-4 w-44">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    percentage > 85
                                      ? "bg-rose-500"
                                      : percentage > 60
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-9 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              d.status === "OPERATIONAL"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : d.status === "HIGH_DEMAND"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                            }`}>
                              {d.status}
                            </span>
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

        {/* Tab 2: Broadcasts */}
        {activeTab === "BROADCASTS" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Institutional Advisories
              </h3>
              {announcements.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
                  No hospital directives published.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        ann.priority === "URGENT" || ann.priority === "CRITICAL"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                      }`}>
                        {ann.priority}
                      </span>
                      <span className="text-xs text-slate-400">Target: {ann.department}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {ann.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {ann.content}
                    </p>
                    <div className="text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      Issued by {ann.authorName}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Broadcast Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Issue Hospital Directive
              </h3>
              <form onSubmit={handleCreateBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Directive Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ward 4 Maintenance Window"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Directive Body
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Instructions for hospital units..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Target Unit
                  </label>
                  <select
                    value={annDept}
                    onChange={(e) => setAnnDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    <option value="ALL">All Hospital Units</option>
                    <option value="Emergency Treatment Unit (ETU)">Emergency Treatment Unit (ETU)</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Paediatrics">Paediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    <option value="ROUTINE">Routine Operational</option>
                    <option value="URGENT">Urgent Protocol</option>
                    <option value="CRITICAL">Critical Emergency</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Publish Directive
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: New Department Form */}
        {activeTab === "NEW_DEPT" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Add Clinical Department
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Register a new operational medical or surgical unit within this hospital.
            </p>

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nephrology & Hemodialysis Unit"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEPH-01"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Head of Department (Lead Consultant)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Silva"
                    value={deptHOD}
                    onChange={(e) => setDeptHOD(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Total Staff
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={deptStaff}
                    onChange={(e) => setDeptStaff(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Bed Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={deptBeds}
                    onChange={(e) => setDeptBeds(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("DEPARTMENTS")}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Confirm & Register Department
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
