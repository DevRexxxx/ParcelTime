'use client';

import React, { useState } from 'react';
import {
  Package,
  Calendar,
  ShieldCheck,
  Search,
  Sparkles,
  CheckCircle2,
  Layers,
  MapPin,
  UserCheck,
  X,
  Check,
} from 'lucide-react';
import { ParcelItem } from '@/lib/types';
import { getStatusBadge } from '@/lib/utils';

interface ResidentViewProps {
  parcels: ParcelItem[];
  onOpenSchedule: (parcel: ParcelItem) => void;
  onOpenConsolidatedSchedule?: (parcels: ParcelItem[]) => void;
  onOpenOtp: (parcel: ParcelItem) => void;
  onRequestSelfPickup?: (parcelId: string, receiverName?: string) => void;
}

export const ResidentView: React.FC<ResidentViewProps> = ({
  parcels,
  onOpenSchedule,
  onOpenConsolidatedSchedule,
  onOpenOtp,
  onRequestSelfPickup,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Self-pickup modal state
  const [pickupModalParcel, setPickupModalParcel] = useState<ParcelItem | null>(null);
  const [authorizedReceiver, setAuthorizedReceiver] = useState('');

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

  const needsScheduling = activeParcels.filter(
    (p) => p.status === 'RECEIVED' && p.fulfillmentMode !== 'SELF_PICKUP'
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllEligible = () => {
    if (selectedIds.length === needsScheduling.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(needsScheduling.map((p) => p.id));
    }
  };

  const handleConfirmPickup = () => {
    if (!pickupModalParcel) return;
    if (onRequestSelfPickup) {
      onRequestSelfPickup(
        pickupModalParcel.id,
        authorizedReceiver.trim() || 'Self (Resident Priya Sharma)'
      );
    }
    setPickupModalParcel(null);
    setAuthorizedReceiver('');
  };

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
              <div className="flex items-center gap-2">
                {needsScheduling.length > 1 && onOpenConsolidatedSchedule ? (
                  <button
                    onClick={() => onOpenConsolidatedSchedule(needsScheduling)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white text-xs font-semibold shadow-glow-orange flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Consolidate {needsScheduling.length} Parcels</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenSchedule(needsScheduling[0])}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white text-xs font-semibold shadow-glow-orange flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Delivery</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Smart Parcel Consolidation P0 Banner */}
        {needsScheduling.length >= 2 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-purple-500/10 to-transparent border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glass-sm">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-primary/20 text-primary border border-primary/30 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Smart Parcel Consolidation Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold border border-primary/30">
                    P0 Optimization
                  </span>
                </div>
                <p className="text-[11px] text-white/70 mt-0.5">
                  You have {needsScheduling.length} packages awaiting scheduling. Consolidating combines them into 1 single doorstep delivery run for maximum courier efficiency.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={selectAllEligible}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 text-xs font-medium border border-white/10 transition-all"
              >
                {selectedIds.length === needsScheduling.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => {
                  const targetParcels =
                    selectedIds.length >= 2
                      ? needsScheduling.filter((p) => selectedIds.includes(p.id))
                      : needsScheduling;
                  if (onOpenConsolidatedSchedule) {
                    onOpenConsolidatedSchedule(targetParcels);
                  } else {
                    onOpenSchedule(targetParcels[0]);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-orange flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {selectedIds.length >= 2
                    ? `Bundle Selected (${selectedIds.length})`
                    : `Bundle All (${needsScheduling.length})`}
                </span>
              </button>
            </div>
          </div>
        )}

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
              const isEligibleForConsolidation =
                parcel.status === 'RECEIVED' && parcel.fulfillmentMode !== 'SELF_PICKUP';
              const isSelected = selectedIds.includes(parcel.id);
              const isSelfPickup = parcel.fulfillmentMode === 'SELF_PICKUP';

              return (
                <div
                  key={parcel.id}
                  className={`p-5 rounded-3xl glass-panel border transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-primary/60 bg-primary/[0.04] ring-1 ring-primary/40 shadow-glow-orange/20'
                      : 'border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {isEligibleForConsolidation && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(parcel.id)}
                          className="w-4 h-4 rounded accent-[#FF5D00] cursor-pointer"
                          title="Select for consolidation"
                        />
                      )}
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-primary">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{parcel.courier}</h4>
                        <div className="text-[11px] font-mono text-white/50">{parcel.trackingNumber}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSelfPickup && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400">
                          Gate 1 Pickup
                        </span>
                      )}
                      {parcel.isConsolidated && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          <span>Consolidated</span>
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
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
                    {parcel.authorizedReceiver && (
                      <div className="flex justify-between">
                        <span className="text-white/40">Authorized Collector:</span>
                        <span className="text-emerald-400 font-medium">{parcel.authorizedReceiver}</span>
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
                            onClick={() => setPickupModalParcel(parcel)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-medium border border-white/[0.08] transition-all flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3 text-sky-400" />
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

      {/* Hybrid Fulfillment: Self-Pickup Request Modal (Roadmap 4.2 — P0) */}
      {pickupModalParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md p-6 rounded-4xl glass-panel-elevated border border-white/10 shadow-glass-lg space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Self-Pickup at Reception</h3>
                  <p className="text-xs text-white/50">Society Gate 1 Security Counter</p>
                </div>
              </div>
              <button
                onClick={() => setPickupModalParcel(null)}
                className="p-2 rounded-2xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>{pickupModalParcel.courier}</span>
                <span className="font-mono text-primary">{pickupModalParcel.parcelCode}</span>
              </div>
              <div className="text-white/60 text-[11px]">
                Tracking: {pickupModalParcel.trackingNumber}
              </div>
              <div className="text-sky-400 text-[11px] pt-1">
                Storage: {pickupModalParcel.storageLocation}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-white/70 font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                <span>Authorized Receiver (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Leave blank for self, or name (e.g. Aarav Sharma - Roommate)"
                value={authorizedReceiver}
                onChange={(e) => setAuthorizedReceiver(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
              />
              <p className="text-[11px] text-white/40">
                Gate security will verify resident ID or parcel QR badge at pickup.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-white/[0.08]">
              <button
                onClick={() => setPickupModalParcel(null)}
                className="px-4 py-2 rounded-2xl hover:bg-white/[0.08] text-white/70 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPickup}
                className="px-5 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm Gate Pickup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
