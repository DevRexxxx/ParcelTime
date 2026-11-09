'use client';

import React from 'react';
import { Building2, MapPin, Users, Shield } from 'lucide-react';

export const WorkspaceCard: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-cyan-400 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          Your Society
        </span>
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
          Pilot Society
        </span>
      </div>

      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-white">Greenwood Palms</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gate 1 Online</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-white/60">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Tower A & Tower B (240 Units)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[11px]">
          <div className="flex items-center gap-1.5 text-white/60">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>3 Staff On Duty</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>Code Required at Handover</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>Tenant ID: soc_greenwood_01</span>
        <span className="text-cyan-400 text-[10px] cursor-pointer hover:underline">Society Details</span>
      </div>
    </div>
  );
};
