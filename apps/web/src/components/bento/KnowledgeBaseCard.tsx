'use client';

import React from 'react';
import { BookOpen, HelpCircle, ChevronRight } from 'lucide-react';

export const KnowledgeBaseCard: React.FC = () => {
  const articles = [
    { title: '2-Hour Cutoff Rule for Slot Booking', category: 'Rules' },
    { title: 'Safe Handover & OTP Verification Policy', category: 'Security' },
    { title: 'Storage Fee Waiver after 7 Days', category: 'Pricing' },
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-amber-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Society Knowledge Base
        </span>
        <span className="text-[10px] text-white/40 font-mono">Bylaws v1.0</span>
      </div>

      <div className="space-y-2 mb-3">
        {articles.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] cursor-pointer flex items-center justify-between group/kb transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <div className="truncate">
                <div className="text-xs text-white/80 group-hover/kb:text-white truncate font-medium">
                  {item.title}
                </div>
                <div className="text-[10px] text-white/40">{item.category}</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover/kb:text-white transition-all shrink-0" />
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>Instant semantic search</span>
        <span className="text-amber-400 text-[10px] cursor-pointer hover:underline">Explore docs</span>
      </div>
    </div>
  );
};

