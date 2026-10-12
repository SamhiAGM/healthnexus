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
  Building2,
  Sparkles
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
    <section id="contact" className="py-24 bg-[#F0F4F7] text-[#364A5D] relative border-t border-[#D9E3E9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#087F79] bg-[#DFEFEC] border border-[#159B94]/30 px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#087F79]" />
            Inquiries & Hospital Support Desk
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#20364C] tracking-tight">
            Contact HealthNexus Support & Hospital Liaison
          </h2>
          <p className="text-[#43566C] text-base">
            Reach our technical operations team, request facility integration assistance, or submit patient support inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Helplines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] shadow-xs p-6 sm:p-7 space-y-6">
              <h3 className="text-lg font-bold text-[#20364C]">National Helplines & Support</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9]">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#20364C]">1990 Suwa Seriya Ambulance</div>
                    <div className="text-xs text-[#43566C]">Toll-free 24/7 nationwide emergency triage</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9]">
                  <div className="w-10 h-10 rounded-xl bg-[#DFEFEC] border border-[#159B94]/30 flex items-center justify-center text-[#087F79] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#20364C]">1959 Health Promotion Bureau</div>
                    <div className="text-xs text-[#43566C]">Official general health advice and information</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9]">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0F4] border border-[#426DA9]/30 flex items-center justify-center text-[#426DA9] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#20364C]">HealthNexus Official Support</div>
                    <div className="text-xs text-[#43566C] font-mono">Healthnexus.support@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9]">
                  <div className="w-10 h-10 rounded-xl bg-[#EBE8F5] border border-[#EBE8F5] flex items-center justify-center text-[#43566C] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#20364C]">Public Hospital Directory</div>
                    <div className="text-xs text-[#43566C]">Official Ministry of Health 2026 data across 9 provinces</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#DFEFEC]/70 border border-[#159B94]/30 p-5 text-xs text-[#20364C] space-y-2">
              <span className="font-bold text-[#087F79] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Privacy & Data Notice
              </span>
              <p className="leading-relaxed text-[#43566C]">
                HealthNexus (LankaCare.me) operates with rigorous data privacy standards. Do not submit sensitive patient clinical histories or biometric data through general web contact forms.
              </p>
            </div>
          </div>

          {/* Right Column: Contact & Issue Submission Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#F8FAFB] border border-[#D9E3E9] shadow-xs p-6 sm:p-8">
              <h3 className="text-xl font-bold text-[#20364C] mb-1">Send an Inquiry or Feedback</h3>
              <p className="text-xs text-[#43566C] mb-6">
                All inquiries receive an automated tracking ticket reference for administrative follow-up.
              </p>

              {status === "success" && (
                <div className="mb-6 p-4 rounded-xl bg-[#DFEFEC] border border-[#159B94]/40 text-[#087F79] text-sm flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#087F79] shrink-0" />
                  <div>
                    <span className="font-bold">Message submitted successfully!</span>
                    <p className="text-xs text-[#087F79]">Ticket #HN-INQ-{Math.floor(1000 + Math.random() * 9000)} generated. Our support team will respond to your email.</p>
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
                    <label className="block text-xs font-semibold text-[#20364C] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kasun Perera"
                      className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm placeholder:text-[#43566C]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#20364C] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kasun.perera@example.lk"
                      className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm placeholder:text-[#43566C]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#20364C] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="077-1234567"
                      className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm placeholder:text-[#43566C]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#20364C] mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] focus:border-transparent transition"
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
                  <label className="block text-xs font-semibold text-[#20364C] mb-1.5">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, hospital information update, or technical issue..."
                    className="w-full px-4 py-2.5 bg-[#F0F4F7] border border-[#D9E3E9] rounded-xl text-[#20364C] text-sm placeholder:text-[#43566C]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159B94] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3.5 px-6 bg-[#087F79] hover:bg-[#159B94] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
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
