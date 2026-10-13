"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  Plus, 
  FileText, 
  Activity, 
  AlertCircle,
  Home,
  ChevronRight
} from "lucide-react";

interface PublicHealthActivityItem {
  id: string;
  activityCode: string;
  title: string;
  category: string;
  areaJurisdiction: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | string;
  officerName: string;
  observations?: string;
  targetHouseholdCount: number;
  completedDate?: string;
  createdAt?: string;
}

interface SummaryData {
  totalCampaigns: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  targetHouseholds: number;
}

export default function PublicHealthPortalPage() {
  const [activities, setActivities] = useState<PublicHealthActivityItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ACTIVITIES" | "NEW_CAMPAIGN">("ACTIVITIES");

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Vector Control");
  const [newJurisdiction, setNewJurisdiction] = useState("Colombo District - MOH Unit 2");
  const [newHouseholds, setNewHouseholds] = useState(150);
  const [newOfficer, setNewOfficer] = useState("PHI Officer");

  // Update modal/input
  const [selectedActivity, setSelectedActivity] = useState<PublicHealthActivityItem | null>(null);
  const [notesInput, setNotesInput] = useState("");

  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actData, sumData] = await Promise.all([
        apiFetch<any[]>("/api/public-health/activities").catch(() => null),
        apiFetch<any>("/api/public-health/summary").catch(() => null)
      ]);

      if (Array.isArray(actData)) {
        setActivities(actData);
      }
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err) {
      console.error("Failed to load public health data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (!isMounted) return;
      if (!user || !user.roles?.some(r => ["PUBLIC_HEALTH_OFFICER", "FIELD_SUPERVISOR", "HOSPITAL_ADMIN", "SYSTEM_ADMIN"].includes(r))) {
        if (process.env.NODE_ENV === "production") {
          router.push("/auth/staff-login");
          return;
        }
      }
      fetchData();
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const payload = {
        title: newTitle,
        category: newCategory,
        areaJurisdiction: newJurisdiction,
        targetHouseholdCount: Number(newHouseholds),
        officerName: newOfficer
      };

      await apiFetch("/api/public-health/activities", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setActionSuccess(`New Public Health campaign "${newTitle}" created successfully.`);
      setNewTitle("");
      setActiveTab("ACTIVITIES");
      fetchData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Error creating campaign.");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, observations?: string) => {
    setActionError(null);
    try {
      await apiFetch(`/api/public-health/activities/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, observations: observations || "" })
      });

      setActionSuccess(`Activity status successfully marked as ${newStatus}.`);
      setSelectedActivity(null);
      setNotesInput("");
      fetchData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Error updating activity.");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.activityCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.areaJurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || act.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PortalShell
      role="PUBLIC_HEALTH_OFFICER"
      pageTitle="Public Health & Community Medicine Portal"
      breadcrumbs={[{ label: "Portal", href: "/portal/public-health" }, { label: "Operations" }]}
    >
      <div className="space-y-6">
        {/* Banner Alert for Demo */}
        <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <p className="text-sm font-medium text-teal-900 dark:text-teal-200">
              National Health Surveillance Active: Connected to Regional Directorate of Health Services (RDHS).
            </p>
          </div>
          <span className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded-full font-semibold">
            MOH Field Division
          </span>
        </div>

        {/* Action success message */}
        {actionSuccess && (
          <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Campaigns</span>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary ? summary.totalCampaigns : activities.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Community surveillance programs</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {summary ? summary.inProgress : activities.filter(a => a.status === "IN_PROGRESS").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Field teams currently inspecting</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Visits</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {summary ? summary.completed : activities.filter(a => a.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Audit reports filed & released</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Households Covered</span>
              <Home className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {summary ? summary.targetHouseholds : activities.reduce((acc, c) => acc + (c.targetHouseholdCount || 0), 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Target population monitored</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("ACTIVITIES")}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === "ACTIVITIES"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Field Activities & Surveys</span>
          </button>
          <button
            onClick={() => setActiveTab("NEW_CAMPAIGN")}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === "NEW_CAMPAIGN"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Campaign</span>
          </button>
        </div>

        {/* Tab 1: Activities Table */}
        {activeTab === "ACTIVITIES" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by code, title, jurisdiction or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs py-2 px-3 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Activities Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Code / Campaign</th>
                    <th className="px-5 py-3">Area Jurisdiction</th>
                    <th className="px-5 py-3">Officer Assigned</th>
                    <th className="px-5 py-3">Target Size</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        {loading ? "Loading community activities..." : "No public health activities match your search."}
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{act.title}</span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                              {act.activityCode}
                            </span>
                          </div>
                          <div className="text-xs text-teal-600 dark:text-teal-400 mt-0.5 font-medium">
                            {act.category}
                          </div>
                          {act.observations && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-1">
                              &ldquo;{act.observations}&rdquo;
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-1 text-slate-800 dark:text-slate-200 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span>{act.areaJurisdiction}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {act.officerName}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {act.targetHouseholdCount} homes
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            act.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : act.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          }`}>
                            {act.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          {act.status === "SCHEDULED" && (
                            <button
                              onClick={() => handleUpdateStatus(act.id, "IN_PROGRESS")}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                            >
                              Start Survey
                            </button>
                          )}
                          {act.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => {
                                setSelectedActivity(act);
                                setNotesInput(act.observations || "");
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                            >
                              Complete & Report
                            </button>
                          )}
                          {act.status === "COMPLETED" && (
                            <span className="text-xs text-slate-400 font-medium italic">
                              Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: New Campaign Form */}
        {activeTab === "NEW_CAMPAIGN" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Register Community Health Surveillance Campaign
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Create a traceable MOH field campaign or epidemiological inspection program.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Filariasis Night Blood Survey"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Health Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Vector Control">Vector Control (Dengue/Malaria)</option>
                    <option value="Maternal & Child Care">Maternal & Child Health</option>
                    <option value="School Health">School Health & Nutrition</option>
                    <option value="Food & Water Sanitation">Food & Water Sanitation</option>
                    <option value="NCD Screening">NCD Community Screening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Target Households / Population
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newHouseholds}
                    onChange={(e) => setNewHouseholds(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    MOH Jurisdiction / District
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kalutara District - Beruwala MOH"
                    value={newJurisdiction}
                    onChange={(e) => setNewJurisdiction(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Officer (PHI / MOH)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Officer Name"
                    value={newOfficer}
                    onChange={(e) => setNewOfficer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("ACTIVITIES")}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Confirm & Schedule Campaign
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Observations & Completion Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Complete Field Activity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Record findings and observations for <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedActivity.title}</span> ({selectedActivity.activityCode}).
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Inspection Findings / Observations
                  </label>
                  <textarea
                    rows={4}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Enter epidemiological observations, premises compliance notices issued, or public health recommendations..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedActivity.id, "COMPLETED", notesInput)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Submit & Finalize Report
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
