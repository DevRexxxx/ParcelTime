'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Check, Sparkles, Layers } from 'lucide-react';
import { ParcelItem, SlotItem } from '@/lib/types';

interface ScheduleSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: ParcelItem | null;
  parcelsToConsolidate?: ParcelItem[];
  slots: SlotItem[];
  onConfirm: (parcelId: string, slot: SlotItem, note?: string) => void;
  onConfirmConsolidated?: (parcelIds: string[], slot: SlotItem, note?: string) => void;
}

export const ScheduleSlotModal: React.FC<ScheduleSlotModalProps> = ({
  isOpen,
  onClose,
  parcel,
  parcelsToConsolidate,
  slots,
  onConfirm,
  onConfirmConsolidated,
}) => {
  if (!isOpen || (!parcel && (!parcelsToConsolidate || parcelsToConsolidate.length === 0))) return null;

  const isConsolidatedBatch = Boolean(parcelsToConsolidate && parcelsToConsolidate.length > 1);
  const activeParcels = isConsolidatedBatch ? parcelsToConsolidate! : parcel ? [parcel] : [];

  // Default to highest scored / recommended slot or first available
  const recommendedSlot = slots.find((s) => s.recommended && s.isAvailable) || slots.find((s) => s.isAvailable) || slots[0];
  const [selectedSlotId, setSelectedSlotId] = useState<string>(recommendedSlot?.id || '');
  const [deliveryNote, setDeliveryNote] = useState('');

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    if (isConsolidatedBatch && onConfirmConsolidated) {
      onConfirmConsolidated(
        activeParcels.map((p) => p.id),
        selectedSlot,
        deliveryNote
      );
    } else if (parcel) {
      onConfirm(parcel.id, selectedSlot, deliveryNote);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-4xl glass-panel-elevated border border-white/10 shadow-glass-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary border border-primary/30">
              {isConsolidatedBatch ? <Layers className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isConsolidatedBatch ? 'Smart Parcel Consolidation' : 'Schedule Parcel Delivery'}
              </h3>
              <p className="text-xs text-white/50">
                {isConsolidatedBatch
                  ? `Consolidating ${activeParcels.length} packages into a single doorstep delivery run`
                  : 'Choose when you want it brought to your door'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Parcel Badge / Consolidation Summary */}
        {isConsolidatedBatch ? (
          <div className="p-4 rounded-3xl bg-primary/10 border border-primary/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Single Executive Handover Batch</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                {activeParcels.length} Items Bundled
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeParcels.map((p) => (
                <span
                  key={p.id}
                  className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-white/90"
                >
                  {p.courier} ({p.parcelCode})
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{parcel?.courier}</span>
                <span className="font-mono text-primary">({parcel?.parcelCode})</span>
              </div>
              <div className="text-[11px] text-white/50 mt-0.5">
                Unit {parcel?.unitNumber} • Currently in {parcel?.storageLocation}
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Available to Book
            </span>
          </div>
        )}

        {/* Slot Selection */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="text-white/60 font-medium flex items-center justify-between">
              <span>Select Time Window (Deterministic AI Scoring)</span>
              <span className="text-primary font-normal text-[11px]">Cutoff: 2h Prior</span>
            </label>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                const isFull = !slot.isAvailable;
                const isRecommended = slot.recommended && !isFull;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-primary/20 border-primary/60 text-white shadow-glow-orange/30 ring-1 ring-primary/40'
                        : isRecommended
                        ? 'bg-gradient-to-r from-primary/[0.08] to-purple-500/[0.05] border-primary/30 hover:border-primary/50 text-white'
                        : isFull
                        ? 'bg-white/[0.01] border-white/[0.04] text-white/20 cursor-not-allowed'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Clock className={`w-4 h-4 ${isSelected || isRecommended ? 'text-primary' : 'text-white/40'}`} />
                        <div>
                          <div className="font-semibold text-xs text-white flex items-center gap-2">
                            <span>{slot.label}</span>
                            {isRecommended && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center gap-1 font-bold">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Recommended</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/50">
                            {slot.date} • {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isFull ? (
                          <span className="text-[10px] text-rose-400 font-semibold px-2 py-0.5 rounded-full bg-rose-500/10">
                            Slot Full
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/50">
                            {slot.capacity - slot.bookedCount} spots left
                          </span>
                        )}
                      </div>
                    </div>

                    {slot.recommendationReason && (
                      <div className="text-[10px] text-primary/90 flex items-center gap-1 pl-7 font-medium">
                        <span>⚡ {slot.recommendationReason}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Delivery Instructions */}
          <div className="space-y-1.5">
            <label className="text-white/60 font-medium">
              {isConsolidatedBatch ? 'Unified Delivery Note' : 'Delivery Note for Executive'}
            </label>
            <input
              type="text"
              placeholder="e.g. Ring doorbell twice, deliver both packages together"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl hover:bg-white/[0.08] text-white/70 hover:text-white transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSlot || !selectedSlot.isAvailable}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 disabled:opacity-50 text-white font-semibold shadow-glow-orange flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isConsolidatedBatch ? `Confirm Consolidated Run (${activeParcels.length})` : 'Confirm Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


