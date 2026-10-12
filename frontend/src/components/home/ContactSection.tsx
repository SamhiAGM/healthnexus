"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Building2
} from "lucide-react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "General Inquiry",
        message: "",
      });
    }, 800);
  };

  return (
    <section id="contact" className="py-24 bg-[#F8FAFC] text-slate-800 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0F766E] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Inquiries & Hospital Support Desk
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B4D] tracking-tight">
            Contact HealthNexus Support & Hospital Liaison
          </h2>
          <p className="text-slate-600 text-base">
            Reach our technical operations team, request facility integration assistance, or submit patient support inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Helplines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
              <h3 className="text-lg font-bold text-[#172B4D]">National Helplines & Support</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">1990 Suwasariya Ambulance</div>
                    <div className="text-xs text-slate-500">Toll-free 24/7 nationwide emergency triage</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">1959 Health Promotion Bureau</div>
                    <div className="text-xs text-slate-500">Official general health advice and information</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">HealthNexus Official Support</div>
                    <div className="text-xs text-slate-500 font-mono">Healthnexus.support@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Public Hospital Directory</div>
                    <div className="text-xs text-slate-500">Official Ministry of Health 2026 data across 9 provinces</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-teal-50/70 border border-teal-200/80 p-5 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-[#0F766E] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Privacy & Data Notice
              </span>
              <p className="leading-relaxed text-slate-600">
                HealthNexus (LankaCare.me) operates with rigorous data privacy standards. Do not submit sensitive patient clinical histories or biometric data through general web contact forms.
              </p>
            </div>
          </div>

          {/* Right Column: Contact & Issue Submission Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-bold text-[#172B4D] mb-1">Send an Inquiry or Feedback</h3>
              <p className="text-xs text-slate-500 mb-6">
                All inquiries receive an automated tracking ticket reference for administrative follow-up.
              </p>

              {status === "success" && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">Message submitted successfully!</span>
                    <p className="text-xs text-emerald-700">Ticket #HN-INQ-{Math.floor(1000 + Math.random() * 9000)} generated. Our support team will respond to your email.</p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Please provide your full name, valid email address, and message description.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priyantha Perera"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="priyantha@example.lk"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="077-1234567"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Hospital Directory Listing">Hospital Directory Listing / Update</option>
                      <option value="Clinic Schedule Question">Clinic Schedule Question</option>
                      <option value="OTP Verification Issue">OTP & Verification Support</option>
                      <option value="Technical Issue">Technical Platform Issue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, hospital information update, or technical issue..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3 px-6 bg-[#0F766E] hover:bg-[#14B8A6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {status === "submitting" ? "Transmitting..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
