"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Users, 
  CalendarCheck, 
  Sparkles,
  ChevronRight,
  Activity
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-[#0B1730] text-white pt-24 pb-16 overflow-hidden">
      {/* Dynamic Background Gradients and Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-teal-600/20 via-blue-600/15 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute -top-10 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-2xl" />
        {/* Subtle geometric grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines, Value Prop & Working CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* National Healthcare Innovation Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-teal-300 shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next-Generation Healthcare Management LK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
            >
              Connecting People,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-200 to-blue-400">
                Care & Technology.
              </span>
            </motion.h1>

            {/* Supporting Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Making healthcare services more accessible, coordinated, and connected across Sri Lanka through one intelligent digital platform.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/auth/patient-register"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-900/30 hover:shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
              >
                Patient Portal
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/auth/staff-login"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-all"
              >
                Healthcare Staff Portal
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="#services"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-base font-medium text-slate-300 hover:text-teal-400 transition-colors"
              >
                Explore Services
              </Link>
            </motion.div>

            {/* Platform Trust Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Digital Queue Tickets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-400">11 Roles</div>
                <div className="text-xs text-slate-400">RBAC Workspaces</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">25 Districts</div>
                <div className="text-xs text-slate-400">Field Supervision</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Cinematic Mockup / Live Care Card */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Decorative Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 opacity-20 blur-xl" />

              {/* Main Preview Glass Card */}
              <div className="relative rounded-2xl bg-[#0F1E36]/90 border border-slate-700/80 p-6 backdrop-blur-xl shadow-2xl space-y-6">
                
                {/* Simulated Live Queue Card */}
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Colombo National Hospital</div>
                      <div className="text-xs text-slate-400">Cardiology Clinic Room 04</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    Live Queue
                  </span>
                </div>

                {/* Queue Metrics Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      Serving Token
                    </span>
                    <div className="text-3xl font-extrabold text-white mt-1">C-024</div>
                    <span className="text-[11px] text-teal-400">In consultation</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Estimated Wait
                    </span>
                    <div className="text-3xl font-extrabold text-white mt-1">12 <span className="text-sm font-normal text-slate-400">mins</span></div>
                    <span className="text-[11px] text-slate-400">4 patients ahead</span>
                  </div>
                </div>

                {/* Interactive Status Indicator */}
                <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center gap-3 text-xs text-slate-300">
                  <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-teal-300">Automated Patient Reminder</span>
                    <p className="text-[11px] text-slate-400">SMS & digital portal updates sent upon queue advance.</p>
                  </div>
                </div>

                {/* Live Action Quick Link */}
                <Link
                  href="/auth/patient-register"
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white transition-all shadow-md"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Simulate Appointment Request
                </Link>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
