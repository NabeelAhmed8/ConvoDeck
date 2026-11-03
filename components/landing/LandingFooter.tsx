import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-300/40 text-slate-500 text-xs bg-[#ebf0f7] pb-[max(2.5rem,calc(1.5rem+env(safe-area-inset-bottom)))]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand identity */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <div className="w-7 h-7 rounded-xl neu-convex text-slate-900 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
            C
          </div>
          <span className="font-bold text-slate-800">ConvoDeck CRM</span>
          <span>— The WhatsApp Sales Operating System.</span>
        </div>

        {/* Footer Navigation Links with Features included */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
          <a href="#features" className="hover:text-[#ff6422] transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-[#ff6422] transition-colors">
            Pricing
          </a>
          <a href="#contact" className="hover:text-[#ff6422] transition-colors">
            Contact
          </a>
          <Link href="/terms" className="hover:text-[#ff6422] transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#ff6422] transition-colors">
            Privacy
          </Link>
          <Link href="/login" className="hover:text-[#ff6422] transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard" className="hover:text-[#ff6422] transition-colors">
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-slate-300/30 text-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} ConvoDeck Inc. Official WhatsApp Multi-Agent Sales Platform.
      </div>
    </footer>
  );
}

