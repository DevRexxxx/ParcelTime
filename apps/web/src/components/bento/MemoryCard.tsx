'use client';

import React, { useState } from 'react';
import { Brain, CheckCircle, Plus, Trash2 } from 'lucide-react';

export const MemoryCard: React.FC = () => {
  const [memories, setMemories] = useState([
    'Resident prefers evening delivery (6-8 PM)',
    'Unit: Palm Heights Tower B - 402',
    'Delegate code to Guard Ramesh if unreachable',
  ]);

  const removeMemory = (idx: number) => {
    setMemories(memories.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-orange-400 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" />
          Active Spatial Memory
        </span>
        <span className="text-[10px] text-white/40 font-mono">{memories.length} rules learned</span>
      </div>

      <div className="space-y-2 mb-3">
        {memories.map((mem, i) => (
          <div
            key={i}
            className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] flex items-center justify-between gap-2 group/item transition-all"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-white/80 font-normal">{mem}</span>
            </div>
            <button
              onClick={() => removeMemory(i)}
              className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-rose-400 text-white/40 transition-all"
              title="Forget rule"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>Auto-synced across sessions</span>
        <span className="text-primary text-[10px] cursor-pointer hover:underline">Manage preferences</span>
      </div>
    </div>
  );
};

