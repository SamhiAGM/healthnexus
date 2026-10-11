"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface LogoProps {
  variant?: "light" | "dark";
  showWordmark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  variant = "dark",
  showWordmark = true,
  className = "",
  size = "md",
}: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-1 transition-all ${className}`}
      aria-label="HealthConnect LK Home"
    >
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        {/* Animated subtle glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />

        {/* Vector SVG Mark: Abstract letter H with subtle integrated pulse motif */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-sm"
        >
          {/* Rounded base container */}
          <rect
            width="48"
            height="48"
            rx="12"
            fill={isLight ? "rgba(255, 255, 255, 0.12)" : "#0B1730"}
          />
          <rect
            x="0.5"
            y="0.5"
            width="47"
            height="47"
            rx="11.5"
            stroke={isLight ? "rgba(255, 255, 255, 0.25)" : "rgba(13, 148, 136, 0.3)"}
          />

          {/* Left Vertical Pillar */}
          <path
            d="M13 12V36"
            stroke="#0D9488"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right Vertical Pillar */}
          <path
            d="M35 12V36"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Crossbar with Pulse/Heartbeat motif */}
          <motion.path
            d="M13 24H20L22.5 18L25.5 30L28 24H35"
            stroke={isLight ? "#FFFFFF" : "#0D9488"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0.8, opacity: 0.9 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          {/* Central Vitality Node */}
          <circle cx="24" cy="24" r="2" fill="#F59E0B" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1 font-bold tracking-tight">
            <span className={`${textSizes[size]} ${isLight ? "text-white" : "text-[#0B1730]"}`}>
              Health<span className="text-[#0D9488]">Connect</span>
            </span>
            <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20">
              LK
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-wide uppercase ${isLight ? "text-slate-300" : "text-slate-500"}`}>
            Intelligent Care Platform
          </span>
        </div>
      )}
    </Link>
  );
}
