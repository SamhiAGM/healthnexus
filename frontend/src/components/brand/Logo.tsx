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
      className={`inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#108B83] rounded-xl p-1 transition-all ${className}`}
      aria-label="HealthNexus LankaCare.me Home"
    >
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        {/* Animated subtle glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#108B83] to-[#467DA3] opacity-25 blur-sm group-hover:opacity-40 transition-opacity" />

        {/* Vector SVG Mark: Abstract letter H with integrated heart pulse motif */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-xs"
        >
          {/* Rounded base container */}
          <rect
            width="48"
            height="48"
            rx="12"
            fill={isLight ? "rgba(255, 255, 255, 0.15)" : "#243847"}
          />
          <rect
            x="0.5"
            y="0.5"
            width="47"
            height="47"
            rx="11.5"
            stroke={isLight ? "rgba(255, 255, 255, 0.3)" : "rgba(16, 139, 131, 0.4)"}
          />

          {/* Left Vertical Pillar - Teal */}
          <path
            d="M13 12V36"
            stroke="#108B83"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right Vertical Pillar - Medical Blue */}
          <path
            d="M35 12V36"
            stroke="#467DA3"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Crossbar with Pulse / Heartbeat motif */}
          <motion.path
            d="M13 24H20L22.5 18L25.5 30L28 24H35"
            stroke={isLight ? "#FFFFFF" : "#108B83"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0.8, opacity: 0.9 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          {/* Central Vitality Node */}
          <circle cx="24" cy="24" r="2.2" fill="#DDEFE9" stroke="#108B83" strokeWidth="1" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-tight select-none">
          <div className="flex items-center gap-1.5 font-extrabold tracking-tight">
            <span className={`${textSizes[size]} ${isLight ? "text-white" : "text-[#243847]"}`}>
              Health<span className="text-[#108B83]">Nexus</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#DDEFE9] text-[#08786F] border border-[#108B83]/30">
              LK
            </span>
          </div>
          <span className={`text-[10px] font-semibold tracking-wide ${isLight ? "text-slate-200" : "text-[#667986]"}`}>
            Connected Care &bull; LankaCare.me
          </span>
        </div>
      )}
    </Link>
  );
}
