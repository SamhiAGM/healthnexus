"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  SRI_LANKAN_HOSPITALS, 
  Hospital, 
  searchHospitals, 
  getProvinces, 
  getCategories, 
  getDistricts 
} from "@/lib/hospitalData";
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Filter, 
  ExternalLink, 
  Sparkles, 
  Info, 
  Stethoscope, 
  ChevronRight, 
  Compass, 
  CheckCircle2,
  X,
  Share2
} from "lucide-react";

function HospitalsDirectoryContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NAME" | "BEDS" | "CATEGORY">("NAME");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const provinces = useMemo(() => getProvinces(), []);
  const categories = useMemo(() => getCategories(), []);
  const districts = useMemo(() => getDistricts(selectedProvince), [selectedProvince]);

  const filteredHospitals = useMemo(() => {
    const list = searchHospitals({
      query: searchQuery,
      province: selectedProvince,
      category: selectedCategory,
      district: selectedDistrict,
    });

    return [...list].sort((a, b) => {
      if (sortBy === "NAME") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "BEDS") {
        return (b.bedCapacityApprox || 0) - (a.bedCapacityApprox || 0);
      }
      if (sortBy === "CATEGORY") {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });
  }, [searchQuery, selectedProvince, selectedCategory, selectedDistrict, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedProvince("ALL");
    setSelectedCategory("ALL");
    setSelectedDistrict("ALL");
    setSortBy("NAME");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F7] text-[#364A5D] selection:bg-[#159B94] selection:text-white">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        {/* HERO / HEADER BANNER */}
        <div className="bg-gradient-to-b from-[#E8F0F4] via-[#F0F4F7] to-[#F0F4F7] border-b border-[#D9E3E9] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Official Public Healthcare Directory &bull; 2026 Edition</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172B4D] tracking-tight leading-tight">
                Sri Lanka National Hospital Directory
              </h1>
              
              <p className="text-base sm:text-lg text-[#52657F] leading-relaxed">
                Discover government teaching, provincial, district, and base hospitals across all 9 provinces. Verified against Ministry of Health (MoH) Sri Lanka 2026 health institution registries.
              </p>

              {/* Source attribution callout */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#52657F]">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>MoH Accredited Ledger</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>All 9 Provinces Covered</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Includes Base Hospital Kinniya</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-4 sm:p-6 space-y-4">
            
            {/* Primary Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital name, city, district, or alias (e.g., Base Hospital Kinniya, NHSL, Galle, Kandy)..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#172B4D] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent placeholder:text-slate-400 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 bg-slate-200 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Selectors Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Province Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#52657F] mb-1">
                  Province
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict("ALL");
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-sm cursor-pointer"
                >
                  <option value="ALL">All 9 Provinces</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#52657F] mb-1">
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Districts</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} District
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#52657F] mb-1">
                  Hospital Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-semibold text-[#52657F] mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0F766E] shadow-sm cursor-pointer"
                >
                  <option value="NAME">Name (A &rarr; Z)</option>
                  <option value="BEDS">Capacity / Scale (High to Low)</option>
                  <option value="CATEGORY">Category</option>
                </select>
              </div>
            </div>

            {/* Active Query Badges & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#52657F]">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{filteredHospitals.length}</strong> of {SRI_LANKAN_HOSPITALS.length} public hospitals</span>
                {(searchQuery || selectedProvince !== "ALL" || selectedCategory !== "ALL" || selectedDistrict !== "ALL") && (
                  <button
                    onClick={resetFilters}
                    className="ml-2 font-semibold text-[#0F766E] hover:underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Source: MoH Health Institutions 2026 Directory &bull; Updated March 2026
              </div>
            </div>

          </div>
        </div>

        {/* RESULTS GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B4D]">No hospitals matching your search criteria</h3>
              <p className="text-sm text-[#52657F] max-w-md mx-auto">
                Try searching by broader terms like &quot;Kinniya&quot;, &quot;Trincomalee&quot;, &quot;Colombo&quot;, or reset province and category filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-lg hover:bg-[#0d645e] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => {
                const isSpecial = hospital.id === "base-hospital-kinniya";
                return (
                  <div
                    key={hospital.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md ${
                      isSpecial 
                        ? "border-[#14B8A6] ring-1 ring-[#14B8A6]/30 hover:border-[#0F766E]" 
                        : "border-[#E2E8F0] hover:border-slate-300"
                    }`}
                  >
                    {/* Top Header */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5FF] text-[#2563EB] border border-blue-200">
                              {hospital.category}
                            </span>
                            {isSpecial && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAFBF5] text-[#0F766E] border border-teal-200">
                                Featured Institution
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-[#172B4D] group-hover:text-[#0F766E] transition-colors">
                            {hospital.name}
                          </h3>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F766E] shrink-0 group-hover:scale-105 transition-transform">
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Geographic scope */}
                      <div className="space-y-2 text-xs text-[#52657F]">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            {hospital.address}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            <strong>{hospital.district} District</strong> &bull; {hospital.province}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="font-mono text-[#172B4D] font-medium">
                            {hospital.phone}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            Helpline: {hospital.emergencyHelpline}
                          </span>
                        </div>
                      </div>

                      {/* Key clinics preview */}
                      <div className="pt-2 border-t border-[#E2E8F0]/70 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Key Outpatient Units &amp; Clinics
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hospital.featuredClinics.slice(0, 3).map((clinic, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-[#F8FAFC] text-slate-700 px-2 py-0.5 rounded-md border border-[#E2E8F0]"
                            >
                              {clinic}
                            </span>
                          ))}
                          {hospital.featuredClinics.length > 3 && (
                            <span className="text-[11px] text-slate-400 px-1 py-0.5">
                              +{hospital.featuredClinics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {hospital.officialMoHCode}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={hospital.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#2563EB] hover:text-blue-700 font-semibold"
                          title="Open Google Maps Directions"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Map</span>
                        </a>

                        <button
                          onClick={() => setSelectedHospital(hospital)}
                          className="inline-flex items-center gap-1 text-[#0F766E] hover:text-[#0d645e] font-semibold ml-2"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* INSTITUTION DETAIL MODAL */}
        {selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              
              <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF5FF] text-[#2563EB] border border-blue-200">
                      {selectedHospital.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAFBF5] text-[#0F766E] border border-teal-200">
                      {selectedHospital.province}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#172B4D]">
                    {selectedHospital.name}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedHospital(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Known Aliases */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recognized Institutional Names &amp; Aliases
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHospital.aliases.map((alias, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      {alias}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="text-slate-500 font-medium">District &amp; City</div>
                  <div className="font-semibold text-[#172B4D]">{selectedHospital.city}, {selectedHospital.district} District</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="text-slate-500 font-medium">Official MoH Ledger Code</div>
                  <div className="font-mono font-semibold text-[#172B4D]">{selectedHospital.officialMoHCode}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="text-slate-500 font-medium">Regional Health Directorate (RDHS)</div>
                  <div className="font-semibold text-[#172B4D]">{selectedHospital.rdhsArea}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="text-slate-500 font-medium">Verified Contact Telephone</div>
                  <div className="font-mono font-bold text-[#0F766E]">{selectedHospital.phone}</div>
                </div>
              </div>

              {/* Clinics list */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Published Clinical Units &amp; Outpatient Services
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedHospital.featuredClinics.map((clinic, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <Stethoscope className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      <span className="text-slate-800">{clinic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attribution and Legal Transparency Disclaimer */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Public Data Transparency &amp; Attributions
                </div>
                <p>
                  Information sourced directly from official Ministry of Health (MoH) published institutions ledgers ({selectedHospital.sourceAttribution}, verified {selectedHospital.lastUpdated}).
                </p>
                <p className="text-[11px] text-amber-700 pt-1">
                  Note: Inclusion in this public directory does not imply commercial partnership, official government endorsement, or real-time appointment system integration with HealthNexus.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={selectedHospital.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Compass className="w-4 h-4" />
                  Open in Google Maps
                </a>

                <button
                  onClick={() => setSelectedHospital(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Close Record
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function HospitalsDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-400">Loading Hospital Directory...</div>}>
      <HospitalsDirectoryContent />
    </Suspense>
  );
}
