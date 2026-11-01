import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-black text-2xl border border-emerald-500/30 mb-6">
        404
      </div>
      <h1 className="text-3xl font-black text-white">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved to a new URL.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
