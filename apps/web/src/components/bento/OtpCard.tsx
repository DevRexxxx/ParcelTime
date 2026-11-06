'use client';

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';

interface OtpCardProps {
  code?: string;
  parcelCode?: string;
  onRegenerate?: () => void;
}

export const OtpCard: React.FC<OtpCardProps> = ({
  code = '482910',
  parcelCode = 'PT-7621',
  onRegenerate,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-primary/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-white">Handover Code</span>
        </div>
        <span className="text-[10px] text-white/40">Expires in 12m</span>
      </div>

      {/* Code Display Area */}
      <div className="my-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
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
        <p className="text-[10px] text-white/40">Bound to parcel {parcelCode}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRevealed(!revealed)}
          className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white/80 flex items-center justify-center gap-1.5 transition-all"
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{revealed ? 'Hide' : 'Reveal'}</span>
        </button>

        <button
          onClick={handleCopy}
          className="py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white/80 flex items-center justify-center gap-1 transition-all"
          title="Copy Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white/60 hover:text-white transition-all"
            title="Regenerate OTP"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

