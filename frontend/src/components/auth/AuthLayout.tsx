"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { ShieldCheck, ArrowLeft, LucideIcon } from "lucide-react";

export interface AuthFeatureCard {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconColor?: string;
}

export interface AuthLayoutProps {
  badgeText: string;
  badgeIcon: LucideIcon;
  badgeVariant?: "teal" | "blue" | "slate";
  imageSrc: string;
  imageAlt: string;
  headline: string;
  headlineDescription: string;
  featureCards: AuthFeatureCard[];
  securityNote?: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function AuthLayout({
  badgeText,
  badgeIcon: BadgeIcon,
  badgeVariant = "teal",
  imageSrc,
  imageAlt,
  headline,
  headlineDescription,
  featureCards,
  securityNote = "End-to-End Encrypted Session &bull; MoH 2026 Ready",
  title,
  subtitle,
  backHref = "/",
  backLabel = "Back to Home",
  children,
}: AuthLayoutProps) {
  const badgeClasses = {
    teal: "bg-[#DDEFE9] text-[#08786F] border-[#108B83]/30",
    blue: "bg-[#DFEAF0] text-[#467DA3] border-[#467DA3]/30",
    slate: "bg-[#E5E5F2] text-[#698399] border-[#D5E0E3]",
  };

  return (
    <div className="min-h-screen bg-[#EDF2F4] text-[#3C5262] flex flex-col lg:flex-row selection:bg-[#108B83] selection:text-white">
      
      {/* 1. LEFT COLUMN: Visual & Role Assurance Branding (Desktop 5/12) */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#243847] via-[#2A445E] to-[#108B83]/90 text-white">
        
        {/* Background Imagery with Cinematic Contrast & Lighting */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="45vw"
            className="object-cover object-center filter brightness-[0.38] contrast-[1.08] saturate-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#243847] via-[#243847]/75 to-[#243847]/85" />
          <div className="absolute top-[-10%] left-[-10%] w-[420px] h-[420px] bg-[#108B83]/25 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#467DA3]/25 rounded-full blur-[120px]" />
        </div>

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Logo variant="light" size="lg" />
          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#DDEFE9] text-xs font-semibold backdrop-blur-md">
            <BadgeIcon className="w-3.5 h-3.5 text-[#63E2D8]" />
            <span>{badgeText}</span>
          </div>
        </div>

        {/* Central Headlines & Feature Cards */}
        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {headline}
          </h1>
          <p className="text-sm xl:text-base text-slate-200/90 leading-relaxed font-normal">
            {headlineDescription}
          </p>

          <div className="grid grid-cols-1 gap-3.5 pt-2">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md transition-all hover:bg-white/15"
                >
                  <Icon className={`w-5 h-5 mb-2 ${card.iconColor || "text-teal-200"}`} />
                  <div className="text-sm font-bold text-white">{card.title}</div>
                  <div className="text-xs text-slate-200/80 mt-0.5 leading-relaxed">{card.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-slate-200/80">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-200" />
            <span dangerouslySetInnerHTML={{ __html: securityNote }} />
          </span>
          <Link
            href={backHref}
            className="text-[#63E2D8] hover:text-white font-semibold transition-colors flex items-center gap-1"
          >
            <span>{backLabel}</span>
            <span>&rarr;</span>
          </Link>
        </div>

      </div>

      {/* 2. RIGHT COLUMN: Form Container with Elevated Card (Desktop 7/12) */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Mobile Header Bar */}
          <div className="lg:hidden flex justify-between items-center pb-3 border-b border-[#D5E0E3]">
            <Logo variant="dark" size="sm" />
            <Link
              href={backHref}
              className="text-xs font-bold text-[#108B83] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </Link>
          </div>

          {/* Form Header */}
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${badgeClasses[badgeVariant]}`}>
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243847] tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#667986] mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Elevated Form Card Container */}
          <div className="rounded-3xl bg-[#FAFBFA] border border-[#D5E0E3] p-6 sm:p-8 shadow-xs">
            {children}
          </div>

        </div>
      </div>

    </div>
  );
}
