'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: string;
  glowColor?: 'orange' | 'purple' | 'blue';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  glowColor = 'orange',
  onClick,
}) => {
  const glowClasses = {
    orange: 'hover:border-primary/40 hover:shadow-glow-orange/30 group-hover:text-primary',
    purple: 'hover:border-purple-500/40 hover:shadow-glow-purple/30 group-hover:text-purple-400',
    blue: 'hover:border-blue-500/40 hover:shadow-glow-blue/30 group-hover:text-blue-400',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 rounded-3xl glass-panel transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border border-white/[0.08] ${glowClasses[glowColor]}`}
    >
      {/* Background soft glow spot */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/[0.02] group-hover:bg-primary/[0.08] blur-2xl transition-all duration-500 pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors">
          {title}
        </span>
        <div className="p-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] group-hover:scale-110 transition-transform">
          <Icon className="w-4 h-4 text-white/70 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span className="text-[11px] font-medium text-emerald-400 flex items-center">
            {trend}
            <ArrowUpRight className="w-3 h-3" />
          </span>
        )}
      </div>

      <p className="mt-1 text-[11px] text-white/40">{subtext}</p>
    </div>
  );
};

