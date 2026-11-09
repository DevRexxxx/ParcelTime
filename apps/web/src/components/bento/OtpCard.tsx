'use client';

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface OtpCardProps {
  code?: string;
  parcelCode?: string;
  onRegenerate?: () => void;
}

export const OtpCard: React.FC<OtpCardProps> = ({
  code = '482910',
  parcelCode = 'PT-7621',
  onRegenerate: _onRegenerate,
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-primary/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-white">Delivery Code</span>
        </div>
        <span className="text-[10px] text-white/40">Valid for 15m</span>
      </div>

      {/* Code Display Area */}
      <div className="my-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          {code.split('').map((digit, i) => (
            <div
              key={i}
              className={`w-9 h-11 rounded-xl flex items-center justify-center font-mono text-xl font-bold transition-all ${
                revealed
                  ? 'bg-primary/20 border border-primary/40 text-white shadow-glow-orange/30'
                  : 'bg-white/[0.04] border border-white/10 text-white/30 backdrop-blur-sm'
              }`}
            >
              {revealed ? digit : '•'}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/50 font-medium">Bound to parcel {parcelCode}</p>
      </div>

      {/* Safety Notice per Spec C2 & 5.3 */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-1 text-[10px] text-white/50">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>Only tell this code to the person at your door.</span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white/90 flex items-center justify-center gap-1.5 transition-all hover:scale-101"
        >
          {revealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Digits</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Reveal Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
