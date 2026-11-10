'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Navigation, Store, Hash, Check } from 'lucide-react';
import { ShipmentItem } from '@/lib/types';

interface TrackShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrack: (shipment: Omit<ShipmentItem, 'id' | 'internalStatus' | 'externalStatus' | 'discoverySource'>) => void;
}

export const TrackShipmentModal: React.FC<TrackShipmentModalProps> = ({
  isOpen,
  onClose,
  onTrack,
}) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierCode, setCarrierCode] = useState('DELHIVERY');
  const [merchantName, setMerchantName] = useState('Amazon India');
  const [orderReference, setOrderReference] = useState('');
  const [detectedNote, setDetectedNote] = useState('');

  if (!isOpen) return null;

  const handleTrackingChange = (val: string) => {
    setTrackingNumber(val);
    const clean = val.trim().toUpperCase();

    // Auto-detect carrier
    if (clean.startsWith('FMPC') || clean.startsWith('OD')) {
      setCarrierCode('EKART');
      setMerchantName('Flipkart');
      setDetectedNote('⚡ Detected Flipkart Ekart Logistics');
    } else if (clean.startsWith('14') || clean.startsWith('31') || clean.startsWith('18')) {
      setCarrierCode('DELHIVERY');
      setDetectedNote('⚡ Detected Delhivery Surface Express');
    } else if (clean.startsWith('APWA') || clean.startsWith('40')) {
      setCarrierCode('AMAZON_LOGISTICS');
      setMerchantName('Amazon India');
      setDetectedNote('⚡ Detected Amazon Shipping');
    } else if (/^[0-9]{9,11}$/.test(clean)) {
      setCarrierCode('BLUEDART');
      setDetectedNote('⚡ Detected Blue Dart Express');
    } else {
      setDetectedNote('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    onTrack({
      trackingNumber: trackingNumber.trim(),
      carrierCode,
      merchantName: merchantName.trim() || 'E-Commerce Retailer',
      orderReference: orderReference.trim() || undefined,
      estimatedDeliveryAt: 'Arriving in 1-2 days',
      latestEventDescription: 'Tracking registered. Carrier sync active.',
    });

    onClose();
    setTrackingNumber('');
    setOrderReference('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0D0101] border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-glass-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Track Incoming Shipment
                </h3>
                <p className="text-xs text-white/50">
                  Universal fallback for manual or shared parcel tracking
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Tracking Number Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Tracking Number / AWB
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => handleTrackingChange(e.target.value)}
                  placeholder="e.g. 140928192019 or FMPC0123456"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/60 transition-colors font-mono"
                />
                <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-white/40" />
              </div>
              {detectedNote && (
                <p className="text-xs text-primary mt-1 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {detectedNote}
                </p>
              )}
            </div>

            {/* Carrier Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Logistics Carrier
              </label>
              <select
                value={carrierCode}
                onChange={(e) => setCarrierCode(e.target.value)}
                className="w-full bg-[#181010] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
              >
                <option value="DELHIVERY">Delhivery Surface / Express</option>
                <option value="BLUEDART">Blue Dart Express</option>
                <option value="EKART">Ekart Logistics (Flipkart)</option>
                <option value="AMAZON_LOGISTICS">Amazon Shipping / Logistics</option>
                <option value="ECOM_EXPRESS">Ecom Express</option>
                <option value="FEDEX">FedEx India</option>
                <option value="DTDC">DTDC Express</option>
                <option value="INDIA_POST">India Post Speed Post</option>
                <option value="OTHER">Other Carrier</option>
              </select>
            </div>

            {/* Merchant / Store */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-white/50" />
                  Merchant / Store
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Amazon, Flipkart, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-white/50" />
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  placeholder="e.g. 408-7291038..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-white/15 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-glow-orange transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Start Live Tracking
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

