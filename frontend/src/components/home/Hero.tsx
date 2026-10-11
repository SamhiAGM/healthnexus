"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Users, 
  CalendarCheck, 
  Sparkles,
  ChevronRight,
  Activity,
  CheckCircle2
} from "lucide-react";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [videoError, setVideoError] = useState(false);

  // Staggered text variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const headlineWords = [
    { text: "Connecting", highlight: false },
    { text: "People,", highlight: false },
    { text: "Care", highlight: true },
    { text: "&", highlight: true },
    { text: "Technology.", highlight: true },
  ];

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center bg-[#0B1730] text-white pt-24 pb-16 overflow-hidden">
      
      {/* 1. CINEMATIC BACKGROUND LAYER */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* Cinematic Background Video with Video Error / Fallback Handling */}
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            poster="/images/hospital_hero_poster.jpg"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.08] saturate-[0.9] transform scale-105 transition-all duration-1000"
          >
            <source src="/videos/hospital_hero_bg.mp4" type="video/mp4" />
          </video>
        ) : null}

        {/* Photorealistic High-Resolution Fallback Poster */}
        <div 
          className={`absolute inset-0 transition-opacity duration-700 ${videoError ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Image
            src="/images/hospital_hero_poster.jpg"
            alt="Modern Hospital Collaboration Facility"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.45] contrast-[1.08] saturate-[0.9]"
          />
        </div>

        {/* Deep Multi-Layered Navy & Teal Ambient Light Overlays for Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1730]/95 via-[#0B1730]/80 to-[#0B1730]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1730] via-transparent to-[#0B1730]/60" />

        {/* Dynamic Glowing Radial Highlights */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-teal-500/20 via-blue-600/15 to-transparent rounded-full blur-3xl opacity-75" />
        <div className="absolute -top-16 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-500/15 rounded-full blur-2xl" />

        {/* Refined Geometric Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* 2. FOREGROUND HERO CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Staggered Headlines, Value Prop & Working CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* National Healthcare Innovation Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-xs font-semibold text-teal-300 shadow-lg shadow-teal-950/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>National Digital Healthcare Platform LK</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </motion.div>

            {/* Staggered Heading Reveal */}
            <motion.h1 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] flex flex-wrap justify-center lg:justify-start gap-x-3.5 gap-y-1"
            >
              {headlineWords.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  className={
                    word.highlight
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-blue-400 drop-shadow-sm inline-block"
                      : "inline-block text-white"
                  }
                >
                  {word.text}
                </motion.span>
              ))}
            </motion.h1>

            {/* Supporting Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Making public healthcare services more accessible, coordinated, and connected across Sri Lanka through one intelligent digital platform.
            </motion.p>

            {/* Primary Action Buttons with Micro-elevation */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/auth/patient-register"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-900/40 hover:shadow-teal-500/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Patient Portal
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/auth/staff-login"
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 hover:border-slate-600 rounded-xl transition-all duration-200 backdrop-blur-md transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Healthcare Staff Portal
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="#services"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 text-base font-medium text-slate-300 hover:text-teal-400 transition-colors"
              >
                Explore Services
              </Link>
            </motion.div>

            {/* Platform Capabilities Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">Live</div>
                <div className="text-xs text-slate-400 mt-0.5">Digital Queue Tokens</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">11 Roles</div>
                <div className="text-xs text-slate-400 mt-0.5">RBAC Workspaces</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">Island-wide</div>
                <div className="text-xs text-slate-400 mt-0.5">Districts & Hospitals</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Redesigned Demo Queue Preview Card */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Subtle Ambient Behind Card */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-500/30 to-blue-600/30 opacity-30 blur-xl pointer-events-none" />

              {/* Glassmorphic Queue Card */}
              <div className="relative rounded-2xl bg-[#0F1E36]/90 border border-slate-700/80 p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
                
                {/* Header Banner */}
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
                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    Demo Queue Preview
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
                    <span className="text-[11px] text-teal-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      In consultation
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Estimated Wait
                    </span>
                    <div className="text-3xl font-extrabold text-white mt-1">12 <span className="text-sm font-normal text-slate-400">mins</span></div>
                    <span className="text-[11px] text-slate-400 mt-0.5">4 patients ahead</span>
                  </div>
                </div>

                {/* Patient Notification Status Indicator */}
                <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center gap-3 text-xs text-slate-300">
                  <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-teal-300">Automated Patient Alert</span>
                    <p className="text-[11px] text-slate-400">Digital and SMS ticket updates transmitted as line advances.</p>
                  </div>
                </div>

                {/* Live Action Quick Link */}
                <Link
                  href="/auth/patient-register"
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
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
