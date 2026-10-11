"use client";

import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Filter,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface Facility {
  id: string;
  name: string;
  district: string;
  province: string;
  type: "National Teaching Hospital" | "Provincial General Hospital" | "District General Hospital" | "Base Hospital";
  beds: number;
  phone: string;
  clinics: string[];
  status: "Open 24/7" | "Clinic Hours Active";
}

const SRI_LANKA_FACILITIES: Facility[] = [
  {
    id: "nhsl-colombo",
    name: "National Hospital of Sri Lanka (NHSL)",
    district: "Colombo",
    province: "Western Province",
    type: "National Teaching Hospital",
    beds: 3400,
    phone: "011-2691111",
    clinics: ["Cardiology", "Neurology", "Orthopedics", "Diabetic Care", "General OPD"],
    status: "Open 24/7",
  },
  {
    id: "cshw-colombo",
    name: "Castle Street Hospital for Women",
    district: "Colombo",
    province: "Western Province",
    type: "National Teaching Hospital",
    beds: 850,
    phone: "011-2696225",
    clinics: ["Maternal Health", "Gynecology", "Neonatal Care", "Antenatal OPD"],
    status: "Open 24/7",
  },
  {
    id: "th-kandy",
    name: "National Hospital Kandy",
    district: "Kandy",
    province: "Central Province",
    type: "National Teaching Hospital",
    beds: 2290,
    phone: "081-2222261",
    clinics: ["Cardiology", "Oncology", "Pediatrics", "Nephrology", "General OPD"],
    status: "Open 24/7",
  },
  {
    id: "th-karapitiya",
    name: "Teaching Hospital Karapitiya",
    district: "Galle",
    province: "Southern Province",
    type: "National Teaching Hospital",
    beds: 1800,
    phone: "091-2232176",
    clinics: ["General Surgery", "Cardiology", "Pediatrics", "Dermatology", "OPD"],
    status: "Open 24/7",
  },
  {
    id: "th-jaffna",
    name: "Teaching Hospital Jaffna",
    district: "Jaffna",
    province: "Northern Province",
    type: "National Teaching Hospital",
    beds: 1350,
    phone: "021-2222261",
    clinics: ["General Medicine", "Pediatrics", "Obstetrics", "ENT", "General OPD"],
    status: "Open 24/7",
  },
  {
    id: "pgh-badulla",
    name: "Provincial General Hospital Badulla",
    district: "Badulla",
    province: "Uva Province",
    type: "Provincial General Hospital",
    beds: 1200,
    phone: "055-2222261",
    clinics: ["Pulmonology", "Orthopedics", "Cardiology", "General OPD"],
    status: "Open 24/7",
  },
  {
    id: "dgh-gampaha",
    name: "District General Hospital Gampaha",
    district: "Gampaha",
    province: "Western Province",
    type: "District General Hospital",
    beds: 950,
    phone: "033-2222261",
    clinics: ["General OPD", "Pediatrics", "Gynecology", "Eye Clinic"],
    status: "Open 24/7",
  },
  {
    id: "bh-homagama",
    name: "Base Hospital Homagama",
    district: "Colombo",
    province: "Western Province",
    type: "Base Hospital",
    beds: 420,
    phone: "011-2855261",
    clinics: ["General OPD", "Dental", "Maternity", "Pediatrics"],
    status: "Clinic Hours Active",
  },
];

export function FacilityDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");

  const districts = ["All", "Colombo", "Kandy", "Galle", "Jaffna", "Badulla", "Gampaha"];

  const filteredFacilities = SRI_LANKA_FACILITIES.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.clinics.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDistrict = selectedDistrict === "All" || fac.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <section id="facilities" className="py-24 bg-[#081225] text-white relative overflow-hidden">
      
      {/* Background Lighting Accents */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-bold uppercase tracking-widest text-teal-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Accredited Public Hospital Directory
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Find Public Hospitals & Active Clinic Sessions
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Directly search hospitals, discover specialized outpatient clinics, and connect with local clinical desks across Sri Lanka.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0F1E36] border border-slate-700/80 rounded-2xl p-4 sm:p-6 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital name or specialty (e.g. Cardiology, NHSL, Galle, Badulla)..."
                className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* District Selector */}
            <div className="md:col-span-4 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                {districts.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d === "All" ? "All Districts (Island-wide)" : `${d} District`}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
            <span>Showing <strong>{filteredFacilities.length}</strong> accredited hospital facilities</span>
            <span className="text-teal-400">Verified Sri Lankan Provincial Healthcare Tier Data</span>
          </div>
        </div>

        {/* Hospital Cards Grid with Elevation Physics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="group rounded-2xl bg-[#0F1E36]/80 border border-slate-700/60 p-6 flex flex-col justify-between hover:border-teal-500/50 hover:bg-[#0F1E36] transition-all duration-300 hover:shadow-2xl hover:shadow-teal-950/30 hover:-translate-y-1.5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/40 px-2.5 py-1 rounded w-fit">
                      {fac.district} • {fac.province}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                    <CheckCircle className="w-3 h-3" />
                    {fac.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {fac.type} • <strong>{fac.beds}</strong> Inpatient Beds
                  </p>
                </div>

                {/* Clinics Tags */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    Active Outpatient Clinics:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.clinics.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-900/80 text-slate-300 border border-slate-700/80"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Phone & Booking Action */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <a
                  href={`tel:${fac.phone}`}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span>{fac.phone}</span>
                </a>

                <a
                  href="/auth/patient-register"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all shadow-sm"
                >
                  <span>Book Clinic</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
