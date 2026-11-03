"use client";

import React from "react";
import { Sparkles, ShieldCheck, Star } from "lucide-react";

export function HeroSegmentedInfoPill() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 sm:mt-16">
      <div className="neu-segmented-bar p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 divide-y sm:divide-y-0 sm:divide-x divide-slate-300/60">
        {/* Cell 1: Free Trial */}
        <div className="w-full sm:flex-1 py-2 sm:py-1 px-3 sm:px-4 flex items-center justify-center sm:justify-start gap-2.5">
          <div className="w-7 h-7 rounded-full neu-convex flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6422]" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">
              Free 14-Day Trial
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
              Full workspace access
            </p>
          </div>
        </div>

        {/* Cell 2: Guarantee */}
        <div className="w-full sm:flex-1 py-2 sm:py-1 px-3 sm:px-4 flex items-center justify-center sm:justify-start gap-2.5">
          <div className="w-7 h-7 rounded-full neu-convex flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">
              No Credit Card Required
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
              Cancel or upgrade anytime
            </p>
          </div>
        </div>

        {/* Cell 3: Rating */}
        <div className="w-full sm:flex-1 py-2 sm:py-1 px-3 sm:px-4 flex items-center justify-center sm:justify-start gap-2.5">
          <div className="w-7 h-7 rounded-full neu-convex flex items-center justify-center shrink-0">
            <Star className="w-3.5 h-3.5 fill-[#ff6422] text-[#ff6422]" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none">
              4.9/5 Rating
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
              From 250+ sales teams
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

