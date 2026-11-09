'use client';

import React from 'react';
import { Bookmark, Sparkles, Send } from 'lucide-react';

interface PromptLibraryCardProps {
  onExecutePrompt?: (prompt: string) => void;
}

export const PromptLibraryCard: React.FC<PromptLibraryCardProps> = ({ onExecutePrompt }) => {
  const prompts = [
    'When is my Amazon package arriving today?',
    'Schedule my pending delivery for tomorrow evening',
    'How do I collect my parcel from Gate 1 reception?',
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-pink-400 flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5" />
          Quick Prompts
        </span>
        <span className="text-[10px] text-white/40 font-mono">1-Click</span>
      </div>

      <div className="space-y-2 mb-3">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onExecutePrompt?.(p)}
            className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] hover:bg-pink-500/10 hover:border-pink-500/30 border border-white/[0.05] flex items-center justify-between group/p transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="text-xs text-white/80 group-hover/p:text-white truncate font-normal">
                {p}
              </span>
            </div>
            <Send className="w-3 h-3 text-white/30 group-hover/p:text-pink-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>Resident assistance shortcuts</span>
        <span className="text-pink-400 text-[10px] cursor-pointer hover:underline">Help center</span>
      </div>
    </div>
  );
};
