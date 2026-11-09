'use client';

import React, { useState } from 'react';
import { X, Printer, Copy, Check, ShieldCheck, Box, User, Home, Sparkles } from 'lucide-react';
import { ParcelItem } from '@/lib/types';

interface QrBadgeModalProps {
  isOpen: boolean;
  parcel: ParcelItem | null;
  onClose: () => void;
}

export const QrBadgeModal: React.FC<QrBadgeModalProps> = ({
  isOpen,
  parcel,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !parcel) return null;

  const handleCopy = () => {
    const text = `PARCELTIME SECURE TOKEN\nParcel Code: ${parcel.parcelCode}\nTracking: ${parcel.trackingNumber}\nRecipient: ${parcel.recipientName}\nUnit: ${parcel.unitNumber} (${parcel.tower})\nStorage: ${parcel.storageLocation}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-4xl glass-panel-elevated border border-white/10 shadow-glass-lg space-y-6 overflow-hidden">
        {/* Neon Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary border border-primary/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Security QR Badge</h3>
              <p className="text-xs text-white/50">Physical parcel verification token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Physical Badge Card */}
        <div
          id="printable-qr-badge"
          className="relative p-6 rounded-3xl bg-black/60 border border-white/[0.12] space-y-5 shadow-2xl relative z-10 text-white"
        >
          {/* Badge Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                ParcelTime 2030 Spatial
              </span>
            </div>
            <span className="text-[10px] text-white/40 font-mono">
              VAULT-ID #{parcel.id.slice(-6).toUpperCase()}
            </span>
          </div>

          {/* QR Code Graphic Centerpiece */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div className="p-4 rounded-2xl bg-white text-black shadow-lg">
              {/* High-fidelity SVG QR representation */}
              <svg
                className="w-36 h-36"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* QR Finder patterns */}
                <rect x="10" y="10" width="30" height="30" rx="4" stroke="black" strokeWidth="6" />
                <rect x="18" y="18" width="14" height="14" rx="2" fill="black" />

                <rect x="80" y="10" width="30" height="30" rx="4" stroke="black" strokeWidth="6" />
                <rect x="88" y="18" width="14" height="14" rx="2" fill="black" />

                <rect x="10" y="80" width="30" height="30" rx="4" stroke="black" strokeWidth="6" />
                <rect x="18" y="88" width="14" height="14" rx="2" fill="black" />

                {/* QR Data Grid Matrix */}
                <rect x="48" y="14" width="6" height="6" rx="1" fill="black" />
                <rect x="62" y="14" width="6" height="6" rx="1" fill="black" />
                <rect x="48" y="28" width="6" height="6" rx="1" fill="black" />
                <rect x="55" y="21" width="6" height="6" rx="1" fill="black" />
                <rect x="62" y="35" width="6" height="6" rx="1" fill="black" />

                <rect x="14" y="48" width="6" height="6" rx="1" fill="black" />
                <rect x="28" y="55" width="6" height="6" rx="1" fill="black" />
                <rect x="35" y="48" width="6" height="6" rx="1" fill="black" />

                <rect x="48" y="48" width="10" height="10" rx="2" fill="#FF5D00" />
                <rect x="65" y="52" width="6" height="6" rx="1" fill="black" />
                <rect x="75" y="45" width="6" height="6" rx="1" fill="black" />
                <rect x="88" y="48" width="6" height="6" rx="1" fill="black" />
                <rect x="98" y="55" width="6" height="6" rx="1" fill="black" />

                <rect x="48" y="72" width="6" height="6" rx="1" fill="black" />
                <rect x="62" y="72" width="6" height="6" rx="1" fill="black" />
                <rect x="55" y="86" width="6" height="6" rx="1" fill="black" />
                <rect x="48" y="98" width="6" height="6" rx="1" fill="black" />
                <rect x="62" y="98" width="6" height="6" rx="1" fill="black" />

                <rect x="78" y="78" width="6" height="6" rx="1" fill="black" />
                <rect x="92" y="78" width="6" height="6" rx="1" fill="black" />
                <rect x="85" y="92" width="6" height="6" rx="1" fill="black" />
                <rect x="98" y="98" width="6" height="6" rx="1" fill="black" />
              </svg>
            </div>
            <div className="text-center">
              <span className="text-xl font-extrabold tracking-wider text-primary font-mono">
                {parcel.parcelCode}
              </span>
              <p className="text-[11px] text-white/50 font-mono tracking-tight mt-0.5">
                {parcel.trackingNumber}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <Home className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-white/40">Unit / Flat</div>
                <div className="font-bold text-white truncate">{parcel.unitNumber} ({parcel.tower.split('-')[0].trim()})</div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <User className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-white/40">Resident</div>
                <div className="font-bold text-white truncate">{parcel.recipientName}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <Box className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-white/40">Courier</div>
                <div className="font-bold text-white truncate">{parcel.courier}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-white/40">Storage Vault</div>
                <div className="font-bold text-white truncate">{parcel.storageLocation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-400">Token Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white/70" />
                <span>Copy Token</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white text-xs font-semibold shadow-glow-orange flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
