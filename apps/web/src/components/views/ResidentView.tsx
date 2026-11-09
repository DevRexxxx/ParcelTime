'use client';

import React, { useState } from 'react';
import {
  Package,
  Calendar,
  ShieldCheck,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ParcelItem } from '@/lib/types';
import { getStatusBadge } from '@/lib/utils';

interface ResidentViewProps {
  parcels: ParcelItem[];
  onOpenSchedule: (parcel: ParcelItem) => void;
  onOpenOtp: (parcel: ParcelItem) => void;
}

export const ResidentView: React.FC<ResidentViewProps> = ({
  parcels,
  onOpenSchedule,
  onOpenOtp,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [search, setSearch] = useState('');

  const activeParcels = parcels.filter(
    (p) => p.status !== 'DELIVERED' && p.status !== 'CANCELLED'
  );
  const historyParcels = parcels.filter(
    (p) => p.status === 'DELIVERED' || p.status === 'CANCELLED'
  );

  const displayed = (activeTab === 'active' ? activeParcels : historyParcels).filter(
    (p) =>
      p.courier.toLowerCase().includes(search.toLowerCase()) ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.parcelCode.toLowerCase().includes(search.toLowerCase())
  );

  const needsScheduling = activeParcels.filter((p) => p.status === 'RECEIVED');

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="relative p-6 sm:p-8 rounded-4xl glass-panel-orange border border-primary/30 shadow-glass-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Unit A-102 Resident Concierge</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Good evening, Priya Sharma
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                You have {activeParcels.length} active packages in the society pipeline.
              </p>
            </div>

            {needsScheduling.length > 0 && (
              <button
                onClick={() => onOpenSchedule(needsScheduling[0])}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white text-xs font-semibold shadow-glow-orange flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Pending Delivery</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] w-fit">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-primary text-white shadow-glow-orange'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Active Packages ({activeParcels.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-primary text-white shadow-glow-orange'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Delivery History ({historyParcels.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by courier or tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/40 outline-none focus:border-primary/50 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Parcels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.length === 0 ? (
            <div className="col-span-2 p-12 rounded-3xl glass-panel text-center text-white/40 text-xs">
              No packages matching your filters.
            </div>
          ) : (
            displayed.map((parcel) => {
              const badge = getStatusBadge(parcel.status);
              return (
                <div
                  key={parcel.id}
                  className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-primary">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{parcel.courier}</h4>
                        <div className="text-[11px] font-mono text-white/50">{parcel.trackingNumber}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-white/60 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
                    <div className="flex justify-between">
                      <span className="text-white/40">Parcel Code:</span>
                      <span className="font-mono text-white font-medium">{parcel.parcelCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Vault Location:</span>
                      <span className="text-white">{parcel.storageLocation}</span>
                    </div>
                    {parcel.scheduledTime && (
                      <div className="flex justify-between">
                        <span className="text-white/40">Delivery Slot:</span>
                        <span className="text-primary font-medium">{parcel.scheduledTime}</span>
                      </div>
                    )}
                    {parcel.notes && (
                      <div className="flex justify-between">
                        <span className="text-white/40">Instructions:</span>
                        <span className="text-white/80">{parcel.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] text-white/40">{parcel.receivedAt}</span>

                    <div className="flex items-center gap-2">
                      {parcel.status === 'RECEIVED' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenSchedule(parcel)}
                            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-orange flex items-center gap-1 transition-all"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Slot</span>
                          </button>
                          <button
                            onClick={() => alert(`Self-pickup request registered for ${parcel.parcelCode}. Reception Gate 1 has been notified.`)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-medium border border-white/[0.08] transition-all"
                          >
                            <span>Pick Up at Gate</span>
                          </button>
                        </div>
                      )}

                      {parcel.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => onOpenOtp(parcel)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-semibold flex items-center gap-1 animate-pulse transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Show Delivery Code</span>
                        </button>
                      )}

                      {parcel.status === 'DELIVERED' && (
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Handover Complete</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

