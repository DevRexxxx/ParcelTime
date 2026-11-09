'use client';

import React, { useState } from 'react';
import { X, Check, AlertTriangle, KeyRound, Delete, Sparkles } from 'lucide-react';
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
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const correctOtp = parcel.otpCode || '482910';

  const handleKeyPress = (digit: string) => {
    if (otp.length < 6) {
      setOtp((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setOtp((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setOtp('');
    setError(null);
  };

  const handleQuickFill = () => {
    setOtp(correctOtp);
    setError(null);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a full 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    // Simulate verification
    setTimeout(() => {
      if (otp === correctOtp) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5D00', '#9333EA', '#3B82F6'],
        });
        onSuccess(parcel.id);
        onClose();
      } else {
        const nextAttempts = attemptsLeft - 1;
        setAttemptsLeft(nextAttempts);
        if (nextAttempts <= 0) {
          setError('Security lockdown: maximum invalid attempts exceeded.');
        } else {
          setError(`Incorrect OTP code. ${nextAttempts} attempt${nextAttempts > 1 ? 's' : ''} remaining.`);
        }
      }
      setIsVerifying(false);
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm p-6 sm:p-7 rounded-4xl glass-panel-elevated border border-white/10 shadow-glass-lg space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2 rounded-2xl bg-primary/20 text-primary border border-primary/30">
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

        {/* Demo Hint Banner */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-white/70 flex items-center justify-between gap-2">
          <div className="text-left text-[11px] text-white/60">
            Ask resident for their code.
            <div className="font-mono text-primary font-medium">Valid: {correctOtp}</div>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-2.5 py-1 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[10px] font-semibold flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto Fill</span>
          </button>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder="••••••"
              className="w-full text-center tracking-[0.7em] font-mono text-2xl py-2.5 rounded-2xl bg-white/[0.04] border border-white/15 text-white outline-none focus:border-primary/60 focus:shadow-glow-orange/30 transition-all"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2 animate-shake">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* On-screen Spatial Touch Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/[0.08] text-white font-semibold text-sm transition-all hover:scale-102"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] text-xs font-medium transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/[0.08] text-white font-semibold text-sm transition-all hover:scale-102"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] flex items-center justify-center transition-all"
              aria-label="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl hover:bg-white/[0.08] text-white/70 text-xs font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6 || attemptsLeft <= 0}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-orange flex items-center justify-center gap-2 transition-all hover:scale-103 active:scale-97"
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
