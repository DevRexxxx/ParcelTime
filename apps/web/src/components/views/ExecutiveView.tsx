'use client';

import React, { useState } from 'react';
import { Truck, CheckCircle2, QrCode, ShieldCheck, XCircle, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { ParcelItem } from '@/lib/types';
import { getStatusBadge } from '@/lib/utils';

interface ExecutiveViewProps {
  parcels: ParcelItem[];
  onStartDelivery: (parcel: ParcelItem) => void;
  onOpenVerifyOtp: (parcel: ParcelItem) => void;
}

export const ExecutiveView: React.FC<ExecutiveViewProps> = ({
  parcels,
  onStartDelivery,
  onOpenVerifyOtp,
}) => {
  const [activeTab, setActiveTab] = useState<'my_tasks' | 'pool'>('my_tasks');

  const myTasks = parcels.filter(
    (p) => p.status === 'OUT_FOR_DELIVERY' || p.status === 'ASSIGNED'
  );
  const poolTasks = parcels.filter((p) => p.status === 'SCHEDULED');

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-4xl glass-panel-orange border border-primary/30 shadow-glass-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Truck className="w-4 h-4" />
              <span>Internal Courier & Delivery Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Rajesh Kumar
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              {myTasks.length} active delivery tasks assigned to your shift.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>On Duty • Shift Active</span>
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] w-fit">
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'my_tasks'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            My Assigned Tasks ({myTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('pool')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pool'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Available Society Task Pool ({poolTasks.length})
          </button>
        </div>

        {/* Task Cards */}
        <div className="space-y-3">
          {activeTab === 'my_tasks' ? (
            myTasks.length === 0 ? (
              <div className="p-12 rounded-3xl glass-panel text-center text-white/40 text-xs">
                No active tasks currently assigned. Claim one from the Society Task Pool.
              </div>
            ) : (
              myTasks.map((parcel) => {
                const isOut = parcel.status === 'OUT_FOR_DELIVERY';
                return (
                  <div
                    key={parcel.id}
                    className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-white text-base">
                          {parcel.parcelCode}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isOut
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}
                        >
                          {isOut ? 'Out For Delivery' : 'Assigned (In Vault)'}
                        </span>
                      </div>
                      <div className="text-xs text-white/80 font-medium">
                        Unit {parcel.unitNumber} ({parcel.tower}) • {parcel.recipientName}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {parcel.courier} • From: {parcel.storageLocation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!isOut ? (
                        <button
                          onClick={() => onStartDelivery(parcel)}
                          className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <QrCode className="w-4 h-4 text-primary" />
                          <span>Scan QR & Start</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenVerifyOtp(parcel)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white text-xs font-bold shadow-glow-orange flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>Verify Handover OTP</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            poolTasks.map((parcel) => (
              <div
                key={parcel.id}
                className="p-5 rounded-3xl glass-panel border border-white/[0.08] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{parcel.parcelCode}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      Scheduled
                    </span>
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    Unit {parcel.unitNumber} • {parcel.scheduledTime || 'Tomorrow 09:00 - 11:00'}
                  </div>
                </div>

                <button
                  onClick={() => onStartDelivery(parcel)}
                  className="px-4 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-orange flex items-center gap-1.5 transition-all"
                >
                  <span>Claim & Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

