"use client";

import React from "react";
import { 
  Search, 
  CalendarCheck, 
  CheckCircle2, 
  UserCheck, 
  Stethoscope, 
  BellRing,
  ArrowRight
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Find Service & Clinic",
      description: "Search your nearest government or base hospital by district, specialty, or clinic schedule.",
      icon: Search,
    },
    {
      number: "02",
      title: "Book or Walk-In",
      description: "Reserve a clinic appointment online or receive an assisted check-in token at the hospital desk.",
      icon: CalendarCheck,
    },
    {
      number: "03",
      title: "Digital Queue Ticket",
      description: "Receive your live ticket number. Track queue progress from home or the waiting area on your phone.",
      icon: UserCheck,
    },
    {
      number: "04",
      title: "Doctor Consultation",
      description: "Step in when your number is called. Doctors log findings, lab requests, and digital prescriptions.",
      icon: Stethoscope,
    },
    {
      number: "05",
      title: "Follow-Up & Care",
      description: "Automated SMS/portal reminders guide you to scheduled follow-up visits and medication refills.",
      icon: BellRing,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white text-[#172B4D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Patient Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How HealthNexus Works
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Streamlining every touchpoint from the moment you discover care to your completed consultation.
          </p>
        </div>

        {/* Timeline Process */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-teal-400 transition-all duration-300 shadow-xs hover:shadow-sm"
              >
                {/* Step Number Badge */}
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-extrabold flex items-center justify-center text-lg mb-4 shadow-xs">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>

                <div className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1">
                  Step {step.number}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Connecting Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-300">
                    <ArrowRight className="w-5 h-5 text-teal-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
