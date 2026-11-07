'use client';

import React, { useState } from 'react';
import { Sparkles, Check, ChevronDown, Bot, Layers } from 'lucide-react';

interface AiModelCardProps {
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
}

export const AiModelCard: React.FC<AiModelCardProps> = ({
  selectedModel = 'ParcelAI Spatial 2.4',
  onSelectModel,
}) => {
  const [current, setCurrent] = useState(selectedModel);
  const [open, setOpen] = useState(false);

  const models = [
    {
      id: 'ParcelAI Spatial 2.4',
      desc: 'Optimized for VisionOS spatial cards & slots',
      badge: 'Fastest',
      accent: 'text-primary',
    },
    {
      id: 'Logistics-4o Omni',
      desc: 'Deep reasoning for cross-society routing',
      badge: 'Balanced',
      accent: 'text-purple-400',
    },
    {
      id: 'Claude Logistics 3.5 Sonnet',
      desc: 'Complex dispute resolution & audit verification',
      badge: 'Highest Precision',
      accent: 'text-blue-400',
    },
  ];

  const handleSelect = (m: string) => {
    setCurrent(m);
    onSelectModel?.(m);
    setOpen(false);
  };

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-purple-400 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5" />
          AI Model Engine
        </span>
        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
          VisionOS Mode
        </span>
      </div>

      <div className="space-y-2">
        <div
          onClick={() => setOpen(!open)}
          className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{current}</div>
              <div className="text-[10px] text-white/50">Multi-modal reasoning & scheduling</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>

        {open && (
          <div className="p-2 rounded-2xl bg-[#0D0101]/95 border border-white/10 shadow-glass-lg space-y-1.5 animate-in fade-in zoom-in-95">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                  current === m.id
                    ? 'bg-primary/15 border border-primary/40 text-white'
                    : 'hover:bg-white/[0.05] text-white/70 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span>{m.id}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40">{m.desc}</div>
                </div>
                {current === m.id && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/40 pt-3 mt-3 border-t border-white/[0.06]">
        <span>Context window</span>
        <span className="text-white/70 font-mono text-[10px]">128k spatial memory</span>
      </div>
    </div>
  );
};

