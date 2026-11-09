'use client';

import React, { useState } from 'react';
import { X, Package, QrCode, Check } from 'lucide-react';
import { ParcelItem } from '@/lib/types';

interface RegisterParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (parcel: Partial<ParcelItem>) => void;
}

export const RegisterParcelModal: React.FC<RegisterParcelModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  if (!isOpen) return null;

  const [courier, setCourier] = useState('Amazon Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [unitNumber, setUnitNumber] = useState('102');
  const [tower, setTower] = useState('Tower A - Aspen');
  const [recipientName, setRecipientName] = useState('Priya Sharma');
  const [storageLocation, setStorageLocation] = useState('Storage Vault - Shelf A');
  const [notes, setNotes] = useState('');

  const couriers = [
    'Amazon Logistics',
    'Blue Dart Express',
    'Delhivery',
    'DTDC Courier',
    'Shadowfax',
    'Ekart',
    'FedEx',
  ];

  const storageOptions = [
    'Storage Vault - Shelf A',
    'Reception Front Counter',
    'Smart Locker Bay 1',
    'Oversized Package Bay',
  ];

  const handleBarcodeScan = () => {
    const randomTrk = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setTrackingNumber(randomTrk);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParcel: Partial<ParcelItem> = {
      id: `p-${Date.now()}`,
      parcelCode: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      courier,
      trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-8)}`,
      unitNumber,
      tower,
      recipientName,
      status: 'RECEIVED',
      storageLocation,
      receivedAt: 'Just now',
      notes,
    };
    onRegister(newParcel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-4xl glass-panel-elevated border border-white/10 shadow-glass-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary border border-primary/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Register Inbound Parcel</h3>
              <p className="text-xs text-white/50">Speed express check-in under 30 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Courier & Barcode scan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-white/60 font-medium">Courier Partner</label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
              >
                {couriers.map((c) => (
                  <option key={c} value={c} className="bg-[#160c0c] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-white/60 font-medium">Tracking Number</label>
                <button
                  type="button"
                  onClick={handleBarcodeScan}
                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Scan Barcode</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. AZ-91823091"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Tower & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-white/60 font-medium">Tower</label>
              <select
                value={tower}
                onChange={(e) => setTower(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
              >
                <option value="Tower A - Aspen" className="bg-[#160c0c]">Tower A - Aspen</option>
                <option value="Tower B - Birch" className="bg-[#160c0c]">Tower B - Birch</option>
                <option value="Tower C - Cedar" className="bg-[#160c0c]">Tower C - Cedar</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/60 font-medium">Unit Number</label>
              <input
                type="text"
                placeholder="102"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Recipient & Storage Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-white/60 font-medium">Recipient Name (Optional)</label>
              <input
                type="text"
                placeholder="Priya Sharma"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/60 font-medium">Assigned Storage Vault</label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-primary/50"
              >
                {storageOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#160c0c]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Handling Notes */}
          <div className="space-y-1.5">
            <label className="text-white/60 font-medium">Handling Notes (Fragile, Perishable, etc.)</label>
            <input
              type="text"
              placeholder="e.g. Fragile glassware, handle with care"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white font-semibold shadow-glow-orange flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm & Print QR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

