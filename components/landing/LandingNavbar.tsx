"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, MessageSquare } from "lucide-react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-2.5 sm:top-5 inset-x-2 sm:inset-x-6 lg:inset-x-8 max-w-6xl mx-auto z-50 transition-all">
      <div className="neu-card rounded-2xl sm:rounded-full px-3 sm:px-6 h-15 sm:h-18 flex items-center justify-between border border-white/90 shadow-[8px_8px_24px_rgba(160,178,204,0.3),-8px_-8px_24px_#ffffff] bg-white/95 backdrop-blur-md">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 sm:gap-3 group min-w-0"
          aria-label="ConvoDeck Home"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 text-base sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            C
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 block leading-none truncate">
              ConvoDeck
            </span>
            <span className="text-[8.5px] sm:text-[10px] text-blue-600 font-semibold tracking-wider uppercase block mt-0.5 truncate">
              WhatsApp Sales CRM
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-600"
        >
          <a
            href="#features"
            className="px-3.5 py-2 rounded-full hover:neu-pressed hover:text-blue-600 transition-all whitespace-nowrap"
          >
            Features
          </a>
          <a
            href="#pipeline"
            className="px-3.5 py-2 rounded-full hover:neu-pressed hover:text-blue-600 transition-all whitespace-nowrap"
          >
            Pipeline
          </a>
          <a
            href="#pricing"
            className="px-3.5 py-2 rounded-full hover:neu-pressed hover:text-blue-600 transition-all whitespace-nowrap"
          >
            Pricing Plans
          </a>
          <a
            href="#contact"
            className="px-3.5 py-2 rounded-full hover:neu-pressed hover:text-blue-600 transition-all whitespace-nowrap"
          >
            Contact Sales
          </a>
        </nav>

        {/* Desktop Auth Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 neu-btn px-4 py-2 rounded-full transition-all cursor-pointer bg-white whitespace-nowrap shrink-0"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 neu-btn-primary text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap shrink-0"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 neu-btn px-3 py-1.5 rounded-full bg-white hidden min-[440px]:block sm:hidden whitespace-nowrap shrink-0"
          >
            Sign In
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="p-2 text-slate-600 hover:text-slate-900 neu-btn rounded-full transition-colors cursor-pointer bg-white shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer Navigation */}
      {mobileMenuOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Mobile Navigation Menu"
            className="absolute top-20 inset-x-0 neu-card rounded-3xl p-6 z-50 lg:hidden shadow-[12px_12px_30px_rgba(160,178,204,0.35),-10px_-10px_30px_#ffffff] animate-in slide-in-from-top-3 duration-200 bg-white border border-slate-200/80"
          >
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-800">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-full hover:neu-pressed hover:text-blue-600 transition-all"
              >
                Features &amp; Benefits
              </a>
              <a
                href="#pipeline"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-full hover:neu-pressed hover:text-blue-600 transition-all"
              >
                Visual Sales Pipeline
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-full hover:neu-pressed hover:text-blue-600 transition-all"
              >
                Pricing Plans
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-full hover:neu-pressed hover:text-blue-600 transition-all"
              >
                Contact Sales Team
              </a>

              <div className="pt-4 border-t border-slate-200/80 flex flex-col gap-2.5">
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 neu-btn-primary text-white rounded-full text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 neu-btn text-slate-700 rounded-full text-center text-xs font-semibold bg-white"
                >
                  Sign In to Workspace
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
