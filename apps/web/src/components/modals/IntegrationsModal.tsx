'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck, RefreshCw, Trash2, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { IntegrationItem } from '@/lib/types';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: IntegrationItem[];
  onToggleGmail: (connected: boolean, deleteData?: boolean) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  integrations,
  onToggleGmail,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const gmailInt = integrations.find((i) => i.provider === 'GMAIL');
  const isConnected = gmailInt?.status === 'ACTIVE';

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  const handleDisconnect = (deleteData = false) => {
    onToggleGmail(false, deleteData);
    setShowDeleteConfirm(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#0D0101] border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-glass-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  External Discovery Integrations
                </h3>
                <p className="text-xs text-white/50">
                  Zero-effort shipment ingestion from your verified accounts
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

          {/* Gmail Integration Card */}
          <div className="mt-6 space-y-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-white">Gmail Shipment Ingestion</h4>
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active Watch
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          Disconnected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">
                      {isConnected
                        ? `Connected as ${gmailInt?.accountEmail || 'priya.sharma@gmail.com'}`
                        : 'Connect Google account to discover incoming parcels automatically'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security & Least-Privilege Transparency */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Privacy & Least-Privilege Guarantees (§12 & §14)</span>
                </div>
                <ul className="text-white/50 space-y-1 pl-5 list-disc">
                  <li>Only scans order confirmation and shipping dispatch notices.</li>
                  <li>Never reads personal emails, financial credentials, or shopping passwords.</li>
                  <li>Data is end-to-end encrypted with resident-controlled deletion anytime.</li>
                </ul>
              </div>

              {isConnected ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Last synced: {gmailInt?.lastSyncedAt || 'Today, 11:42 PM'}</span>
                    <button
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Reconciling...' : 'Sync Now'}
                    </button>
                  </div>

                  {!showDeleteConfirm ? (
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleDisconnect(false)}
                        className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        Disconnect Integration
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Disconnect & Wipe Data
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                      <p className="text-xs text-rose-300 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        Wipe all email-discovered shipment records from your account?
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-2.5 py-1 text-xs text-white/70 hover:text-white rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDisconnect(true)}
                          className="px-3 py-1 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded font-semibold transition-colors"
                        >
                          Confirm & Purge
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => onToggleGmail(true)}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-glow-orange transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Authorize Google OAuth (gmail.readonly)
                  </button>
                </div>
              )}
            </div>

            {/* Aggregator & Marketplace Notes */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Multi-carrier tracking aggregator active (AfterShip / Shiprocket)</span>
              </div>
              <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                Auto-hooked
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
