'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Check, Sparkles, Shield } from 'lucide-react';
import { ParcelItem, SlotItem } from '@/lib/types';

interface ScheduleSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: ParcelItem | null;
  slots: SlotItem[];
  onConfirm: (parcelId: string, slot: SlotItem, note?: string) => void;
}

export const ScheduleSlotModal: React.FC<ScheduleSlotModalProps> = ({
  isOpen,
  onClose,
  parcel,
  slots,
  onConfirm,
}) => {
  if (!isOpen || !parcel) return null;

  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0]?.id || '');
  const [deliveryNote, setDeliveryNote] = useState('');

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    onConfirm(parcel.id, selectedSlot, deliveryNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-4xl glass-panel-elevated border border-white/10 shadow-glass-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary border border-primary/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Schedule Parcel Delivery</h3>
              <p className="text-xs text-white/50">Choose when you want it brought to your door</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Parcel Badge */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{parcel.courier}</span>
              <span className="font-mono text-primary">({parcel.parcelCode})</span>
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Unit {parcel.unitNumber} • Currently in {parcel.storageLocation}
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Available to Book
          </span>
        </div>

        {/* Slot Selection */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="text-white/60 font-medium flex items-center justify-between">
              <span>Select Time Window (Cutoff: 2 hours prior)</span>
              <span className="text-primary font-normal text-[11px]">Society Horizon: 14 Days</span>
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                const isFull = !slot.isAvailable;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/20 border-primary/50 text-white shadow-glow-orange/30'
                        : isFull
                        ? 'bg-white/[0.01] border-white/[0.04] text-white/20 cursor-not-allowed'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-white/40'}`} />
                      <div>
                        <div className="font-semibold text-xs text-white">{slot.label}</div>
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Delivery Instructions */}
          <div className="space-y-1.5">
            <label className="text-white/60 font-medium">Delivery Note for Executive</label>
            <input
              type="text"
              placeholder="e.g. Ring doorbell twice, leave with neighbor if unavailable"
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
              <span>Confirm Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

