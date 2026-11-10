'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Plus,
  Search,
  QrCode,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { ParcelItem } from '@/lib/types';
import { getStatusBadge } from '@/lib/utils';
import { QrBadgeModal } from '@/components/modals/QrBadgeModal';

interface ReceptionViewProps {
  parcels: ParcelItem[];
  onOpenRegister: (prefill?: { courier?: string; trackingNumber?: string }) => void;
  onMoveStorage?: (parcel: ParcelItem) => void;
}

export const ReceptionView: React.FC<ReceptionViewProps> = ({
  parcels,
  onOpenRegister,
  onMoveStorage: _onMoveStorage,
}) => {
  const [search, setSearch] = useState('');
  const [filterCourier, setFilterCourier] = useState('ALL');
  const [selectedBadgeParcel, setSelectedBadgeParcel] = useState<ParcelItem | null>(null);

  const filtered = parcels.filter((p) => {
    const matchesSearch =
      p.parcelCode.toLowerCase().includes(search.toLowerCase()) ||
      p.courier.toLowerCase().includes(search.toLowerCase()) ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.unitNumber.includes(search);
    const matchesCourier = filterCourier === 'ALL' || p.courier === filterCourier;
    return matchesSearch && matchesCourier;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Desk Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-4xl glass-panel border border-white/[0.08] shadow-glass-lg">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Inbox className="w-4 h-4" />
              <span>Gate 1 Reception Concierge Desk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Active Society Inbound Registry
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              {parcels.length} parcels currently logged in the society database.
            </p>
          </div>

          <button
            onClick={() => onOpenRegister()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white font-semibold text-xs shadow-glow-orange flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Inbound Parcel (&lt;30s)</span>
          </button>
        </div>

        {/* USIE Expected Inbound Carrier Deliveries */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-primary/5 to-transparent border border-cyan-500/20 shadow-glass-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>External Couriers Arriving Today (USIE Live Feeds)</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-semibold border border-cyan-500/30">
                    2 Arriving
                  </span>
                </h3>
                <p className="text-[11px] text-white/60">
                  Pre-notified by carrier tracking feeds (Delhivery, Ekart). Ready for physical intake when courier reaches gate.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white">Delhivery • 140928192019</div>
                  <div className="text-[10px] text-white/50">For Priya Sharma (Unit A-102) • Amazon</div>
                </div>
              </div>
              <button
                onClick={() => onOpenRegister({ courier: 'Delhivery', trackingNumber: '140928192019' })}
                className="px-2.5 py-1 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
              >
                <span>Check-in</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">Ekart • FMPC019284918</div>
                  <div className="text-[10px] text-white/50">For Priya Sharma (Unit A-102) • Flipkart</div>
                </div>
              </div>
              <button
                onClick={() => onOpenRegister({ courier: 'Ekart', trackingNumber: 'FMPC019284918' })}
                className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/10 text-[11px] font-medium flex items-center gap-1 transition-all"
              >
                <span>Check-in</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Parcel ID, Unit, or Courier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/40 outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            {['ALL', 'Amazon Logistics', 'Blue Dart Express', 'Delhivery', 'DTDC Courier'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCourier(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filterCourier === c
                    ? 'bg-primary text-white shadow-glow-orange'
                    : 'bg-white/[0.03] text-white/60 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Parcels Table / Cards */}
        <div className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Parcel Code</th>
                  <th className="py-3.5 px-4">Courier & Tracking</th>
                  <th className="py-3.5 px-4">Unit / Tower</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Vault Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((parcel) => {
                  const badge = getStatusBadge(parcel.status);
                  return (
                    <tr key={parcel.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {parcel.parcelCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{parcel.courier}</div>
                        <div className="font-mono text-[11px] text-white/50">{parcel.trackingNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        <span className="font-semibold">{parcel.unitNumber}</span>
                        <div className="text-[11px] text-white/40">{parcel.tower}</div>
                      </td>
                      <td className="py-3.5 px-4 text-white/80">{parcel.recipientName}</td>
                      <td className="py-3.5 px-4 text-white/70">
                        <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                          {parcel.storageLocation}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {parcel.fulfillmentMode === 'SELF_PICKUP' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400">
                              Gate Pickup
                            </span>
                          )}
                          {parcel.isConsolidated && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                              Consolidated
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {parcel.fulfillmentMode === 'SELF_PICKUP' && parcel.status !== 'DELIVERED' && (
                            <button
                              onClick={() => {
                                parcel.status = 'DELIVERED';
                                alert(`Gate 1 handover verified and recorded for ${parcel.parcelCode}. Custody transfer complete.`);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 text-[10px] font-semibold transition-all"
                              title="Verify ID and Hand Over"
                            >
                              Verify Handover
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBadgeParcel(parcel)}
                            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-white/60 hover:text-white transition-all"
                            title="Print QR Badge"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Badge Printing Modal */}
      <QrBadgeModal
        isOpen={!!selectedBadgeParcel}
        parcel={selectedBadgeParcel}
        onClose={() => setSelectedBadgeParcel(null)}
      />
    </div>
  );
};

