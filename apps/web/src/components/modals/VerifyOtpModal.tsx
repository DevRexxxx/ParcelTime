'use client';

import React, { useState } from 'react';
import { X, Check, AlertTriangle, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParcelItem } from '@/lib/types';

interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: ParcelItem | null;
  onSuccess: (parcelId: string) => void;
}

export const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({
  isOpen,
  onClose,
  parcel,
  onSuccess,
}) => {
  if (!isOpen || !parcel) return null;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    // Simulate verification
    setTimeout(() => {
      const correctOtp = parcel.otpCode || '482910';
      if (otp === correctOtp) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5D00', '#9333EA', '#3B82F6'],
        });
        onSuccess(parcel.id);
        onClose();
      } else {
        setError('Incorrect OTP. 4 attempts remaining before challenge locks.');
      }
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-4xl glass-panel-elevated border border-white/10 shadow-glass-lg space-y-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2 rounded-2xl bg-primary/20 text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verify Handover OTP</h3>
              <p className="text-xs text-white/50">{parcel.parcelCode} • Unit {parcel.unitNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-white/70">
          Ask the resident for their 6-digit delivery code generated in the ParcelTime app.
          <div className="mt-1 font-mono text-[11px] text-primary">
            (Demo hint: Valid OTP is {parcel.otpCode || '482910'})
          </div>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="w-full text-center tracking-[1em] font-mono text-2xl py-3 rounded-2xl bg-white/[0.04] border border-white/15 text-white outline-none focus:border-primary/60 focus:shadow-glow-orange/30 transition-all"
            autoFocus
          />

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2 animate-shake">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl hover:bg-white/[0.08] text-white/70 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-orange flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isVerifying ? 'Verifying...' : 'Confirm Delivery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

