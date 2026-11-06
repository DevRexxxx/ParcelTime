'use client';

import React from 'react';
import { Package, Clock, ShieldCheck, HardDrive, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { StatCard } from './StatCard';
import { ActiveDeliveryCard } from './ActiveDeliveryCard';
import { OtpCard } from './OtpCard';
import { VoiceCard } from './VoiceCard';
import { StorageCard } from './StorageCard';
import { ParcelItem } from '@/lib/types';

interface BentoGridProps {
  parcels: ParcelItem[];
  onOpenSchedule: (parcel: ParcelItem) => void;
  onOpenOtp: (parcel: ParcelItem) => void;
  onOpenRegister: () => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  parcels,
  onOpenSchedule,
  onOpenOtp,
  onOpenRegister,
  voiceActive,
  setVoiceActive,
}) => {
  const inStorage = parcels.filter((p) => p.status === 'RECEIVED').length;
  const scheduled = parcels.filter((p) => p.status === 'SCHEDULED').length;
  const outForDelivery = parcels.filter((p) => p.status === 'OUT_FOR_DELIVERY').length;
  const delivered = parcels.filter((p) => p.status === 'DELIVERED').length;

  const activeInTransit = parcels.find((p) => p.status === 'OUT_FOR_DELIVERY');

  return (
    <div className="w-full space-y-4">
      {/* Top Banner & Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="In Storage Vault"
          value={inStorage}
          subtext="Eligible for scheduled delivery"
          icon={Package}
          trend="+2 today"
          glowColor="orange"
        />
        <StatCard
          title="Scheduled Slots"
          value={scheduled}
          subtext="Confirmed with residents"
          icon={Clock}
          glowColor="blue"
        />
        <StatCard
          title="Out For Delivery"
          value={outForDelivery}
          subtext="Live with courier personnel"
          icon={Zap}
          trend="Live"
          glowColor="orange"
        />
        <StatCard
          title="Delivery Success"
          value="99.4%"
          subtext="OTP verified handovers"
          icon={ShieldCheck}
          glowColor="purple"
        />
      </div>

      {/* Main Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Card 1: Active Delivery tracking */}
        <ActiveDeliveryCard
          parcel={activeInTransit}
          onViewOtp={() => activeInTransit && onOpenOtp(activeInTransit)}
        />

        {/* Card 2: Handover Code display */}
        <OtpCard
          code={activeInTransit?.otpCode || '482910'}
          parcelCode={activeInTransit?.parcelCode || 'PT-7621'}
        />

        {/* Card 3: Spatial Voice Assistant */}
        <VoiceCard
          isActive={voiceActive}
          onToggle={() => setVoiceActive(!voiceActive)}
        />

        {/* Card 4: Society Storage Occupancy */}
        <StorageCard />

        {/* Card 5: Quick Prompt Actions & Shortcuts */}
        <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Instant Operations</span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="my-2 space-y-1.5">
            <button
              onClick={onOpenRegister}
              className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-white flex items-center justify-between group transition-all"
            >
              <span>Scan & Register Inbound Parcel</span>
              <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
            </button>
            <button
              onClick={() => {
                const p = parcels.find((p) => p.status === 'RECEIVED');
                if (p) onOpenSchedule(p);
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-white flex items-center justify-between group transition-all"
            >
              <span>Schedule Delivery Window</span>
              <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
            </button>
          </div>
          <div className="text-[10px] text-white/40">
            Connected to 4 courier gateways: Amazon, Blue Dart, Delhivery, DTDC
          </div>
        </div>

        {/* Card 6: AI Memory & Context */}
        <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-purple-500/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Resident Preferences Memory</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2 space-y-1 text-xs">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-white/40 text-[10px] block">Preferred Delivery Slot:</span>
              <span className="text-white font-medium text-[11px]">Evening 18:30 - 20:30 Window</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-white/40 text-[10px] block">Special Instructions:</span>
              <span className="text-white font-medium text-[11px]">Ring doorbell twice • Keep at door</span>
            </div>
          </div>
          <div className="text-[10px] text-white/40">Updated 2 days ago from resident profile</div>
        </div>
      </div>
    </div>
  );
};

