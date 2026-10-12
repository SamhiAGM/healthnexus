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
  CheckCircle2,
  Compass,
  Layers,
  HeartPulse
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
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const headlineWords = [
    { text: "Connected", highlight: false },
    { text: "Care.", highlight: false },
    { text: "Better", highlight: true },
    { text: "Healthcare.", highlight: true },
    { text: "For", highlight: false },
    { text: "Sri", highlight: true },
    { text: "Lanka.", highlight: true },
  ];

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center bg-gradient-to-b from-[#20364C] via-[#2A445E] to-[#20364C] text-white pt-24 pb-16 overflow-hidden">
      
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
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.08] saturate-[0.85] transform scale-105 transition-all duration-1000"
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
            alt="Modern Sri Lankan Hospital Collaboration Facility"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.38] contrast-[1.08] saturate-[0.85]"
          />
        </div>

        {/* Sophisticated Multi-Layered Restrained Navy, Muted Teal & Slate Lighting Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#20364C]/95 via-[#20364C]/80 to-[#20364C]/92" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#20364C] via-transparent to-[#20364C]/70" />

        {/* Balanced Glow Accents */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-[#159B94]/25 via-[#426DA9]/20 to-transparent rounded-full blur-3xl opacity-75" />
        <div className="absolute -top-16 right-10 w-96 h-96 bg-[#426DA9]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#159B94]/15 rounded-full blur-2xl" />

        {/* Subtle Geometric Medical Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
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
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A2C3E]/85 backdrop-blur-md border border-[#159B94]/40 text-xs font-semibold text-[#DFEFEC] shadow-lg shadow-[#087F79]/20"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#159B94]" />
              <span>HealthNexus &bull; LankaCare.me National Healthcare</span>
              <span className="w-2 h-2 rounded-full bg-[#159B94] animate-pulse" />
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
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-[#DFEFEC] via-[#63E2D8] to-[#93C5FD] drop-shadow-sm inline-block"
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
              className="text-lg sm:text-xl text-[#E8F0F4] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              One intelligent healthcare platform connecting people, hospitals, and healthcare professionals through a simpler digital experience.
            </motion.p>

            {/* Primary Action Buttons: Explore Hospitals, Create Account, Discover Services */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/hospitals"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-[#087F79] hover:bg-[#159B94] rounded-xl shadow-lg shadow-[#087F79]/30 hover:shadow-[#159B94]/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border border-teal-400/30"
              >
                Explore Hospitals
                <Compass className="w-4 h-4 text-teal-200 group-hover:rotate-45 transition-transform" />
              </Link>

              <Link
                href="/auth/patient-register"
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-[#DFEFEC] bg-[#1E3348]/90 hover:bg-[#28435E] border border-[#159B94]/50 rounded-xl transition-all duration-200 backdrop-blur-md transform hover:-translate-y-0.5 active:translate-y-0 shadow-md"
              >
                Create Account
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#services"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-base font-semibold text-[#E8F0F4] hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all backdrop-blur-sm"
              >
                <Layers className="w-4 h-4 text-teal-300" />
                Discover Services
              </Link>
            </motion.div>

            {/* Platform Capabilities Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="pt-6 border-t border-slate-700/60 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">Live</div>
                <div className="text-xs text-[#E8F0F4]/80 mt-0.5">Digital Queue Tokens</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#159B94]">11 Roles</div>
                <div className="text-xs text-[#E8F0F4]/80 mt-0.5">RBAC Workspaces</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#93C5FD]">Island-wide</div>
                <div className="text-xs text-[#E8F0F4]/80 mt-0.5">Districts & Hospitals</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Balanced Premium Queue Preview Card */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Subtle Ambient Behind Card */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#159B94]/30 to-[#426DA9]/30 opacity-40 blur-xl pointer-events-none" />

              {/* Sophisticated Balanced Queue Card (Clean Card Surface) */}
              <div className="relative rounded-2xl bg-[#F8FAFB] text-[#20364C] border border-[#D9E3E9] p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
                
                {/* Header Banner */}
                <div className="flex items-center justify-between border-b border-[#D9E3E9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DFEFEC] border border-[#159B94]/30 flex items-center justify-center text-[#087F79] font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#20364C]">Colombo National Hospital</div>
                      <div className="text-xs text-[#43566C]">Cardiology Clinic Room 04</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#DFEFEC] text-[#087F79] border border-[#159B94]/30">
                    Live Queue Preview
                  </span>
                </div>

                {/* Queue Metrics Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9]">
                    <span className="text-xs font-semibold text-[#43566C] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#087F79]" />
                      Serving Token
                    </span>
                    <div className="text-3xl font-extrabold text-[#20364C] mt-1">C-024</div>
                    <span className="text-[11px] font-medium text-[#087F79] flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#159B94] animate-pulse" />
                      In consultation
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F0F4F7] border border-[#D9E3E9]">
                    <span className="text-xs font-semibold text-[#43566C] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#426DA9]" />
                      Estimated Wait
                    </span>
                    <div className="text-3xl font-extrabold text-[#20364C] mt-1">12 <span className="text-sm font-medium text-[#43566C]">mins</span></div>
                    <span className="text-[11px] font-medium text-[#43566C] mt-0.5">4 patients ahead</span>
                  </div>
                </div>

                {/* Patient Notification Status Indicator */}
                <div className="p-3.5 rounded-xl bg-[#DFEFEC]/70 border border-[#159B94]/30 flex items-center gap-3 text-xs text-[#20364C]">
                  <ShieldCheck className="w-5 h-5 text-[#087F79] shrink-0" />
                  <div>
                    <span className="font-bold text-[#087F79]">Automated Patient Alert</span>
                    <p className="text-[11px] text-[#43566C]">Digital and SMS ticket updates transmitted as line advances.</p>
                  </div>
                </div>

                {/* Live Action Quick Link */}
                <Link
                  href="/auth/patient-register"
                  className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold rounded-xl bg-gradient-to-r from-[#087F79] to-[#426DA9] hover:from-[#159B94] hover:to-[#557ebc] text-white transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Request Clinic Appointment
                </Link>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
