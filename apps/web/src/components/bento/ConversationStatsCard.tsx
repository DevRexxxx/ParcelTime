'use client';

import React from 'react';
import { Cpu, Zap, Radio } from 'lucide-react';

export const ConversationStatsCard: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/15 transition-all" />

      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-blue-400">
          Conversation Stats
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <Zap className="w-3 h-3 text-primary" />
            <span>Response Latency</span>
          </div>
          <div className="text-lg font-bold text-white mt-1 font-mono">42 ms</div>
          <div className="text-[10px] text-emerald-400 font-medium">99.9% uptime</div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span>Tokens Processed</span>
          </div>
          <div className="text-lg font-bold text-white mt-1 font-mono">1.2k</div>
          <div className="text-[10px] text-purple-400 font-medium">Context: 128k</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-white/40" />
          <span>Real-time Stream Engine</span>
        </div>
        <span className="text-white/80 font-mono text-[10px]">v2.4-Spatial</span>
      </div>
    </div>
  );
};

