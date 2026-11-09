'use client';

import React from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

interface VoiceCardProps {
  isActive: boolean;
  onToggle: () => void;
  statusText?: string;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  isActive,
  onToggle,
  statusText = 'Ready for voice commands',
}) => {
  return (
    <div className="relative p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-white">Spatial Voice Assistant</span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
              : 'bg-white/5 text-white/40'
          }`}
        >
          {isActive ? 'Listening...' : 'Standby'}
        </span>
      </div>

      {/* Waveform Visualization */}
      <div className="my-3 flex items-center justify-center gap-1.5 h-12">
        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75].map((height, idx) => (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-t from-primary via-purple-500 to-blue-400 animate-pulse'
                : 'bg-white/10'
            }`}
            style={{
              height: isActive ? `${height}%` : '20%',
              animationDelay: `${idx * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Mic toggle and status */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-white/50 truncate">
          {isActive ? '“Schedule my Delhivery package for 7 PM”' : statusText}
        </p>
        <button
          onClick={onToggle}
          className={`p-2 rounded-2xl transition-all duration-200 shrink-0 ${
            isActive
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white'
          }`}
        >
          {isActive ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

