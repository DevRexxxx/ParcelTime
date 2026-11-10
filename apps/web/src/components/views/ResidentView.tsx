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
  Truck,
  Mail,
  Plus,
  Navigation,
  Radio,
  Clock,
} from 'lucide-react';
import { ParcelItem, ShipmentItem, IntegrationItem } from '@/lib/types';
import { INITIAL_SHIPMENTS, INITIAL_INTEGRATIONS } from '@/lib/mockData';
import { getStatusBadge } from '@/lib/utils';
import { TrackShipmentModal } from '../modals/TrackShipmentModal';
import { IntegrationsModal } from '../modals/IntegrationsModal';

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
  const [activeTab, setActiveTab] = useState<'active' | 'shipments' | 'history'>('active');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shipments, setShipments] = useState<ShipmentItem[]>(INITIAL_SHIPMENTS);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);

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

  const displayedShipments = shipments.filter(
    (s) =>
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.carrierCode.toLowerCase().includes(search.toLowerCase()) ||
      s.merchantName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddShipment = (input: Omit<ShipmentItem, 'id' | 'internalStatus' | 'externalStatus' | 'discoverySource'>) => {
    const newShipment: ShipmentItem = {
      id: `sh-${Date.now()}`,
      trackingNumber: input.trackingNumber,
      carrierCode: input.carrierCode,
      merchantName: input.merchantName,
      orderReference: input.orderReference,
      externalStatus: 'IN_TRANSIT',
      internalStatus: 'EXPECTED',
      discoverySource: 'MANUAL',
      estimatedDeliveryAt: input.estimatedDeliveryAt || 'In 1-2 business days',
      lastCarrierEventAt: 'Just now',
      latestEventDescription: input.latestEventDescription || 'Shipment registered manually by resident',
      location: 'Transit Network',
    };
    setShipments((prev) => [newShipment, ...prev]);
  };

  const handleToggleGmail = (connected: boolean, deleteData = false) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.provider === 'GMAIL'
          ? {
              ...i,
              status: connected ? 'ACTIVE' : 'REVOKED',
              lastSyncedAt: connected ? 'Just now (Auto-watch active)' : undefined,
            }
          : i
      )
    );
    if (!connected && deleteData) {
      // Purge email discovered shipments that haven't been received at vault
      setShipments((prev) => prev.filter((s) => s.discoverySource !== 'GMAIL' || s.matchedParcelId));
    }
  };

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] w-fit">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-primary text-white shadow-glow-orange'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Vault Packages ({activeParcels.length})
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'shipments'
                  ? 'bg-primary text-white shadow-glow-orange'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Live Shipments ({shipments.length})</span>
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow-orange/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track Shipment</span>
            </button>

            <button
              onClick={() => setIsIntegrationsModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Gmail Sync</span>
              {integrations.find((i) => i.provider === 'GMAIL')?.status === 'ACTIVE' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search tracking, courier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/40 outline-none focus:border-primary/50 w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Live Shipments Grid (USIE) */}
        {activeTab === 'shipments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedShipments.length === 0 ? (
              <div className="col-span-2 p-12 rounded-3xl glass-panel text-center text-white/40 text-xs space-y-2">
                <Truck className="w-8 h-8 mx-auto text-white/20" />
                <p>No external shipments currently tracked.</p>
                <button
                  onClick={() => setIsTrackModalOpen(true)}
                  className="px-4 py-1.5 bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/30 hover:bg-primary/30"
                >
                  Track your first package
                </button>
              </div>
            ) : (
              displayedShipments.map((s) => {
                const isOutForDelivery = s.externalStatus === 'OUT_FOR_DELIVERY';
                const isDeliveredGate = s.externalStatus === 'DELIVERED_TO_SOCIETY';
                const isVerifiedInVault = Boolean(s.matchedParcelId);

                return (
                  <div
                    key={s.id}
                    className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Carrier & Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{s.carrierCode}</h4>
                              <span className="text-[10px] text-white/50">via {s.merchantName}</span>
                            </div>
                            <span className="text-xs text-white/40 font-mono">{s.trackingNumber}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {isOutForDelivery && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 rounded-full shadow-glow-orange/20 animate-pulse">
                              <Radio className="w-3 h-3 text-orange-400" /> Out for Delivery
                            </span>
                          )}
                          {isDeliveredGate && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                              🏢 At Society Gate
                            </span>
                          )}
                          {s.externalStatus === 'IN_TRANSIT' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                              ⚡ In Transit
                            </span>
                          )}

                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            {s.discoverySource === 'GMAIL' ? (
                              <>
                                <Mail className="w-2.5 h-2.5 text-red-400" /> Gmail Ingestion
                              </>
                            ) : (
                              <>
                                <Navigation className="w-2.5 h-2.5 text-primary" /> Manual Tracking
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Latest Event Note */}
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/80 font-medium">{s.latestEventDescription}</span>
                          <span className="text-white/40">{s.lastCarrierEventAt}</span>
                        </div>
                        {s.location && (
                          <p className="text-[10px] text-white/40 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-white/30" />
                            {s.location}
                          </p>
                        )}
                      </div>

                      {/* Handover Separation Status */}
                      <div className="text-xs">
                        {isVerifiedInVault ? (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Physically verified & stored in gate vault. Ready for doorstep delivery or gate pickup!</span>
                          </div>
                        ) : isDeliveredGate ? (
                          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 shrink-0 text-purple-400" />
                            <span>Courier delivered to society gate desk. Reception staff will verify physical custody shortly.</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>En-route. Expected: <strong className="text-white">{s.estimatedDeliveryAt}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-white/40">
                      <span>Order #{s.orderReference || 'N/A'}</span>
                      <span className="text-primary font-medium">Auto-Synced</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Parcels Grid (Vault Packages & History) */}
        {activeTab !== 'shipments' && (
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

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {parcel.parcelClass && parcel.parcelClass !== 'STANDARD' && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            parcel.parcelClass === 'FRAGILE'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              : parcel.parcelClass === 'HIGH_VALUE'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                          }`}
                        >
                          {parcel.parcelClass === 'FRAGILE'
                            ? '⚡ Fragile'
                            : parcel.parcelClass === 'HIGH_VALUE'
                            ? '💎 High-Value'
                            : parcel.parcelClass}
                        </span>
                      )}
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
        )}
      </div>

      {/* Track Shipment Modal (USIE Universal Fallback) */}
      <TrackShipmentModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onTrack={handleAddShipment}
      />

      {/* Integrations Modal (USIE Gmail Discovery & Privacy) */}
      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        integrations={integrations}
        onToggleGmail={handleToggleGmail}
      />

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
