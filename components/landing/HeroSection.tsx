"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { HeroFeatureTiles } from "./HeroFeatureTiles";
import { HeroShowcaseCard } from "./HeroShowcaseCard";
import { HeroSegmentedInfoPill } from "./HeroSegmentedInfoPill";

export function HeroSection() {
  return (
    <section id="home" className="relative pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-pressed text-[#ea5414] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6422] shrink-0" />
              <span>Official WhatsApp Business CRM</span>
            </div>

            {/* Typography matching reference image */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-slate-900">
              Turn WhatsApp <br className="hidden sm:inline" />
              into your{" "}
              <span className="text-[#ff6422]">
                Everyday Sales Machine.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Discover a CRM designed for real sales momentum. Centralize multi-agent chat, track deal stages visually, and eliminate lost revenue.
            </p>

            {/* CTA Button Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="neu-btn-primary px-6 sm:px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2.5 transition-all shadow-md group cursor-pointer"
              >
                <span>Start Workspace</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </span>
              </Link>
            </div>

            {/* 4 Squircle Feature Tiles from Screenshot */}
            <HeroFeatureTiles />
          </div>

          {/* Right Column: Showcase Card from Screenshot */}
          <div className="lg:col-span-5">
            <HeroShowcaseCard />
          </div>
        </div>

        {/* Bottom Segmented Trust Capsule from Screenshot */}
        <HeroSegmentedInfoPill />
      </div>
    </section>
  );
}

