'use client';

import React, { useState } from 'react';
import { Sliders, Sun, Moon, Volume2, Bell } from 'lucide-react';

export const SettingsCard: React.FC = () => {
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-violet-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Spatial Interface Settings
        </span>
        <span className="text-[10px] text-white/40 font-mono">Customized</span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-white/80">Neon Ambient Glows</span>
          </div>
          <button
            onClick={() => setAmbientGlow(!ambientGlow)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              ambientGlow ? 'bg-primary' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                ambientGlow ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-white/80">Spatial Audio Cues</span>
          </div>
          <button
            onClick={() => setSoundEffects(!soundEffects)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              soundEffects ? 'bg-purple-600' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundEffects ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-white/80">Desktop Notifications</span>
          </div>
          <button
            onClick={() => setPushAlerts(!pushAlerts)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              pushAlerts ? 'bg-blue-600' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                pushAlerts ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>Theme: 2030 Pure Black</span>
        <span className="text-violet-400 text-[10px] font-mono">VisionOS</span>
      </div>
    </div>
  );
};

