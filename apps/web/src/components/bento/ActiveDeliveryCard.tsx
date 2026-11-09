'use client';

import React from 'react';
import { Truck, Navigation, ShieldCheck, ArrowRight } from 'lucide-react';
import { ParcelItem } from '@/lib/types';

interface ActiveDeliveryCardProps {
  parcel?: ParcelItem;
  onViewOtp?: () => void;
}

export const ActiveDeliveryCard: React.FC<ActiveDeliveryCardProps> = ({ parcel, onViewOtp }) => {
  if (!parcel) {
    return (
      <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Active In-Transit</span>
          <Truck className="w-4 h-4 text-white/40" />
        </div>
        <div className="py-6 text-center text-xs text-white/40">
          No parcels currently out for delivery
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-5 rounded-3xl glass-panel-orange border border-primary/30 transition-all duration-300 hover:shadow-glow-orange/30 flex flex-col justify-between overflow-hidden">
      {/* Top Tag & Code */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            Out For Delivery
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg">
          {parcel.parcelCode}
        </span>
      </div>

      {/* Main Details */}
      <div className="my-3">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          {parcel.courier}
          <span className="text-xs font-normal text-white/60">({parcel.trackingNumber})</span>
        </h4>
        <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span>Executive: Rajesh Kumar • Approaching Tower B</span>
        </p>
      </div>

      {/* Progress Line */}
      <div className="space-y-1.5 mb-3">
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-primary via-orange-400 to-amber-300 rounded-full w-3/4 animate-pulse" />
        </div>
        <div className="flex justify-between text-[10px] text-white/40">
          <span>Storage Vault</span>
          <span className="text-primary font-medium">In Transit (ETA 5m)</span>
          <span>Your Door</span>
        </div>
      </div>

      {/* Action to show OTP */}
      <button
        onClick={onViewOtp}
        className="w-full py-2 px-3 rounded-2xl bg-white/[0.08] hover:bg-primary/20 hover:border-primary/40 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all group"
      >
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span>View Handover OTP</span>
        <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

