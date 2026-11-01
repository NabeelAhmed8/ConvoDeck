import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color?: "blue" | "green" | "purple" | "amber";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  color = "blue",
}: StatsCardProps) {
  const colorStyles = {
    blue: "text-slate-900 border-slate-300/50 bg-[#eef2f8]",
    green: "text-slate-900 border-slate-300/50 bg-[#eef2f8]",
    purple: "text-slate-900 border-slate-300/50 bg-[#eef2f8]",
    amber: "text-slate-900 border-slate-300/50 bg-[#eef2f8]",
  };

  return (
    <div className="neu-card neu-card-hover p-5 sm:p-6 rounded-3xl group relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl neu-pressed border ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-bold ${
                trendPositive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
