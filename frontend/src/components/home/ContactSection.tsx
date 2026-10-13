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
    <section id="contact" className="py-24 bg-[#EDF2F4] text-[#3C5262] relative border-t border-[#D5E0E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#08786F] bg-[#DDEFE9] border border-[#108B83]/30 px-3.5 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#108B83]" />
            Inquiries &amp; Hospital Support Desk
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243847] tracking-tight">
            Contact HealthNexus Support &amp; Hospital Liaison
          </h2>
          <p className="text-[#667986] text-base">
            Reach our technical operations team, request facility integration assistance, or submit patient support inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Helplines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-2xs p-6 sm:p-7 space-y-6">
              <h3 className="text-lg font-bold text-[#243847]">National Helplines &amp; Support</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3]">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#243847]">1990 Suwa Seriya Ambulance</div>
                    <div className="text-xs text-[#667986]">Toll-free 24/7 nationwide emergency triage</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3]">
                  <div className="w-10 h-10 rounded-xl bg-[#DDEFE9] border border-[#108B83]/30 flex items-center justify-center text-[#08786F] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#243847]">1959 Health Promotion Bureau</div>
                    <div className="text-xs text-[#667986]">Official general health advice and information</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3]">
                  <div className="w-10 h-10 rounded-xl bg-[#DFEAF0] border border-[#467DA3]/30 flex items-center justify-center text-[#467DA3] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#243847]">HealthNexus Official Support</div>
                    <div className="text-xs text-[#667986] font-mono">Healthnexus.support@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3]">
                  <div className="w-10 h-10 rounded-xl bg-[#E5E5F2] border border-[#E5E5F2] flex items-center justify-center text-[#698399] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#243847]">Public Hospital Directory</div>
                    <div className="text-xs text-[#667986]">Official Ministry of Health 2026 data across 9 provinces</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#DDEFE9]/70 border border-[#108B83]/30 p-5 text-xs text-[#243847] space-y-2">
              <span className="font-bold text-[#08786F] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Privacy &amp; Data Notice
              </span>
              <p className="leading-relaxed text-[#667986]">
                HealthNexus (LankaCare.me) operates with rigorous data privacy standards. Do not submit sensitive patient clinical histories or biometric data through general web contact forms.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] shadow-2xs p-6 sm:p-8">
              <h3 className="text-xl font-bold text-[#243847] mb-1">Send an Inquiry or Feedback</h3>
              <p className="text-xs text-[#667986] mb-6">
                All inquiries receive an automated tracking ticket reference for administrative follow-up.
              </p>

              {status === "success" && (
                <div className="mb-6 p-4 rounded-2xl bg-[#DDEFE9] border border-[#108B83]/40 text-[#08786F] text-sm flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#08786F] shrink-0" />
                  <div>
                    <span className="font-bold">Message submitted successfully!</span>
                    <p className="text-xs text-[#08786F]">Ticket #HN-INQ-{Math.floor(1000 + Math.random() * 9000)} generated. Our support team will respond to your email.</p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Please provide your full name, valid email address, and message description.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kasun Perera"
                      className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm placeholder:text-[#698399]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kasun.perera@example.lk"
                      className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm placeholder:text-[#698399]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="077-1234567"
                      className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm placeholder:text-[#698399]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] focus:border-transparent transition"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Hospital Directory Listing">Hospital Directory Listing / Update</option>
                      <option value="Clinic Schedule Question">Clinic Schedule Question</option>
                      <option value="OTP Verification Issue">OTP &amp; Verification Support</option>
                      <option value="Technical Issue">Technical Platform Issue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#243847] mb-1.5">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, hospital information update, or technical issue..."
                    className="w-full px-4 py-2.5 bg-[#F6F9F8] border border-[#D5E0E3] rounded-xl text-[#243847] text-sm placeholder:text-[#698399]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#108B83] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3.5 px-6 bg-[#108B83] hover:bg-[#08786F] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
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
