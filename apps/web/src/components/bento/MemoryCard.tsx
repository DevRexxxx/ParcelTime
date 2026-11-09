'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, CheckCircle, ShieldAlert } from 'lucide-react';

export const MemoryCard: React.FC = () => {
  const [preferences] = useState([
    'Preferred Delivery Window: 18:30 - 20:30 (Evening)',
    'Household Unit: Greenwood Palms A-102 (Tower A - Aspen)',
    'Notification Channels: WhatsApp & In-App Push Active',
  ]);

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-orange-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Household Delivery Preferences
        </span>
        <span className="text-[10px] text-white/40 font-mono">Unit A-102</span>
      </div>

      <div className="space-y-2 mb-3">
        {preferences.map((pref, i) => (
          <div
            key={i}
            className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] flex items-center justify-between gap-2 group/item transition-all"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-white/80 font-normal">{pref}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Security Invariant Notice */}
      <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-2 text-[10px] text-orange-300/90 leading-tight">
        <ShieldAlert className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Security Policy:</strong> Handover delivery codes are strictly private to your household and can never be shared with gate security or staff.
        </span>
      </div>

      <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>Resident profile synced</span>
        <span className="text-primary text-[10px] cursor-pointer hover:underline">Edit preferences</span>
      </div>
    </div>
  );
};
