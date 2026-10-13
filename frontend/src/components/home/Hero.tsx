"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getCurrentUser, UserProfile } from "@/lib/api";
import { getDashboardRouteForUser } from "@/components/layout/Navbar";
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
  HeartPulse,
  Building2,
  Lock,
  LayoutDashboard
} from "lucide-react";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((u) => {
      if (isMounted) setUser(u);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Staggered text reveal variants
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
    <section className="relative min-h-[92vh] flex items-center justify-center bg-gradient-to-b from-[#EDF2F4] via-[#E7EFF1] to-[#EDF2F4] text-[#243847] pt-28 pb-16 overflow-hidden">
      
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
            poster="/images/hero_hospital_cinematic.jpg"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.02] saturate-[0.95] transform scale-105 transition-all duration-1000 opacity-25"
          >
            <source src="/videos/hospital_hero_bg.mp4" type="video/mp4" />
          </video>
        ) : null}

        {/* Photorealistic High-Resolution Fallback Poster with Cinematic Camera Drift */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ${videoError ? "opacity-35" : "opacity-30"}`}
        >
          <div className="relative w-full h-full animate-kenburns">
            <Image
              src="/images/hero_hospital_cinematic.jpg"
              alt="Cinematic Modern Sri Lankan Hospital & Connected Care Architecture"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.95] contrast-[1.05] saturate-[1.02]"
            />
          </div>
        </div>

        {/* Refined Balanced Middle-Tone Gradients: Soft Mist Blue, Subtle Mint & Calming Lighting */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#EDF2F4]/95 via-[#E7EFF1]/85 to-[#EDF2F4]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#EDF2F4] via-transparent to-[#EDF2F4]/80" />

        {/* Balanced Glow Accents */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-[#108B83]/15 via-[#467DA3]/12 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#467DA3]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#108B83]/12 rounded-full blur-2xl" />

        {/* Subtle Geometric Medical Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #108B83 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* 2. FOREGROUND HERO CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Value Prop & Required Action Buttons */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            
            {/* National Healthcare Innovation Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FAFBFA]/90 backdrop-blur-md border border-[#D5E0E3] text-xs font-semibold text-[#08786F] shadow-xs"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#108B83]" />
              <span>HealthNexus &bull; LankaCare.me National Healthcare Network</span>
              <span className="w-2 h-2 rounded-full bg-[#108B83] animate-pulse" />
            </motion.div>

            {/* Staggered Heading Reveal */}
            <motion.h1 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#243847] leading-[1.12] flex flex-wrap justify-center lg:justify-start gap-x-3.5 gap-y-1"
            >
              {headlineWords.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  className={
                    word.highlight
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-[#108B83] to-[#467DA3] drop-shadow-2xs inline-block"
                      : "inline-block text-[#243847]"
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
              className="text-lg sm:text-xl text-[#3C5262] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              A smarter digital healthcare experience connecting patients, hospitals, and healthcare professionals across Sri Lanka.
            </motion.p>

            {/* Required Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              {user ? (
                <>
                  {/* Authenticated: Go to My Dashboard */}
                  <Link
                    href={getDashboardRouteForUser(user)}
                    className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-[#0F8B80] hover:bg-[#08786F] rounded-xl shadow-md shadow-[#0F8B80]/20 hover:shadow-[#08786F]/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border border-teal-500/20"
                  >
                    <LayoutDashboard className="w-5 h-5 text-teal-100" />
                    <span>Go to My Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-teal-200 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Find Hospitals */}
                  <Link
                    href="/hospitals"
                    className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-[#233B48] bg-[#F8FAF9] hover:bg-white border border-[#D6E3E7] hover:border-[#0F8B80] rounded-xl transition-all duration-200 shadow-xs transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Find Hospitals</span>
                    <Compass className="w-4 h-4 text-[#0F8B80] group-hover:rotate-45 transition-transform" />
                  </Link>

                  {/* Explore Services */}
                  <Link
                    href="#services"
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-base font-semibold text-[#3F5362] hover:text-[#233B48] bg-[#DFEAF0]/70 hover:bg-[#DFEAF0] border border-[#D6E3E7] rounded-xl transition-all"
                  >
                    <Layers className="w-4 h-4 text-[#3A84A8]" />
                    <span>Explore Services</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Primary 1: Find Hospitals */}
                  <Link
                    href="/hospitals"
                    className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-[#0F8B80] hover:bg-[#08786F] rounded-xl shadow-md shadow-[#0F8B80]/20 hover:shadow-[#08786F]/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border border-teal-500/20"
                  >
                    <span>Find Hospitals</span>
                    <Compass className="w-4 h-4 text-teal-100 group-hover:rotate-45 transition-transform" />
                  </Link>

                  {/* Primary 2: Create Patient Account */}
                  <Link
                    href="/auth/patient-register"
                    className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-[#233B48] bg-[#F8FAF9] hover:bg-white border border-[#D6E3E7] hover:border-[#0F8B80] rounded-xl transition-all duration-200 shadow-xs transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Create Patient Account</span>
                    <ArrowRight className="w-4 h-4 text-[#0F8B80] transform group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Primary 3: Explore Services */}
                  <Link
                    href="#services"
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-base font-semibold text-[#3F5362] hover:text-[#233B48] bg-[#DFEAF0]/70 hover:bg-[#DFEAF0] border border-[#D6E3E7] rounded-xl transition-all"
                  >
                    <Layers className="w-4 h-4 text-[#3A84A8]" />
                    <span>Explore Services</span>
                  </Link>

                  {/* Secondary Action: Healthcare Staff Sign In */}
                  <Link
                    href="/auth/staff-login"
                    className="inline-flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold text-[#3A84A8] hover:text-[#233B48] hover:bg-[#DFEAF0]/60 rounded-xl transition-colors border border-transparent hover:border-[#3A84A8]/30"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#3A84A8]" />
                    <span>Healthcare Staff Sign In</span>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Platform Capabilities Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="pt-6 border-t border-[#D5E0E3] grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#243847]">Live</div>
                <div className="text-xs text-[#667986] mt-0.5">Digital Queue Tokens</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#108B83]">11 Roles</div>
                <div className="text-xs text-[#667986] mt-0.5">Role-Based Workspaces</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#467DA3]">40+ Hospitals</div>
                <div className="text-xs text-[#667986] mt-0.5">Official MoH 2026 Registry</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Balanced Premium Live Queue Preview Card */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Subtle Ambient Glow Behind Card */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#108B83]/20 to-[#467DA3]/20 opacity-40 blur-xl pointer-events-none" />

              {/* Elevated Card Surface (#FAFBFA) with Border (#D5E0E3) */}
              <div className="relative rounded-3xl bg-[#FAFBFA] text-[#243847] border border-[#D5E0E3] p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
                
                {/* Header Banner */}
                <div className="flex items-center justify-between border-b border-[#D5E0E3] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DDEFE9] border border-[#108B83]/30 flex items-center justify-center text-[#08786F] font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#243847]">National Hospital of Sri Lanka</div>
                      <div className="text-xs text-[#667986]">Cardiology Clinic Room 04 &bull; Colombo</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#DDEFE9] text-[#08786F] border border-[#108B83]/30">
                    Live Queue
                  </span>
                </div>

                {/* Queue Metrics Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3]">
                    <span className="text-xs font-semibold text-[#667986] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#108B83]" />
                      Serving Token
                    </span>
                    <div className="text-3xl font-extrabold text-[#243847] mt-1">C-024</div>
                    <span className="text-[11px] font-semibold text-[#108B83] flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#108B83] animate-pulse" />
                      In consultation
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F9F8] border border-[#D5E0E3]">
                    <span className="text-xs font-semibold text-[#667986] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#467DA3]" />
                      Estimated Wait
                    </span>
                    <div className="text-3xl font-extrabold text-[#243847] mt-1">12 <span className="text-sm font-medium text-[#667986]">mins</span></div>
                    <span className="text-[11px] font-medium text-[#667986] mt-0.5">4 patients ahead</span>
                  </div>
                </div>

                {/* Patient Notification Status Indicator */}
                <div className="p-3.5 rounded-2xl bg-[#DFEAF0]/80 border border-[#D5E0E3] flex items-center gap-3 text-xs text-[#243847]">
                  <ShieldCheck className="w-5 h-5 text-[#108B83] shrink-0" />
                  <div>
                    <span className="font-bold text-[#08786F]">Automated Patient Alert</span>
                    <p className="text-[11px] text-[#667986]">SMS and portal notifications transmitted as queue advances.</p>
                  </div>
                </div>

                {/* Live Action Quick Link */}
                <Link
                  href="/auth/patient-register"
                  className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold rounded-xl bg-gradient-to-r from-[#108B83] to-[#467DA3] hover:from-[#08786F] hover:to-[#3b6b8d] text-white transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book Clinic Appointment
                </Link>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
