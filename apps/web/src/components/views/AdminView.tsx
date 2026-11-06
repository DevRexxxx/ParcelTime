'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Sliders,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'slots' | 'audit'>('settings');

  const auditLogs = [
    {
      id: 'a-1',
      actor: 'Rajesh Kumar (Executive)',
      action: 'DELIVERY_COMPLETED',
      parcelCode: 'PT-6310',
      time: '14 minutes ago',
      verifiedBy: 'OTP Verified',
      status: 'DELIVERED',
    },
    {
      id: 'a-2',
      actor: 'Rajesh Kumar (Executive)',
      action: 'OUT_FOR_DELIVERY',
      parcelCode: 'PT-7621',
      time: '32 minutes ago',
      verifiedBy: 'QR Scanned',
      status: 'OUT_FOR_DELIVERY',
    },
    {
      id: 'a-3',
      actor: 'Priya Sharma (Resident)',
      action: 'SLOT_BOOKED',
      parcelCode: 'PT-9104',
      time: '2 hours ago',
      verifiedBy: 'Self Scheduled',
      status: 'SCHEDULED',
    },
    {
      id: 'a-4',
      actor: 'Ramesh Guard (Reception)',
      action: 'PARCEL_RECEIVED',
      parcelCode: 'PT-8942',
      time: '3 hours ago',
      verifiedBy: 'Barcode Ingest',
      status: 'RECEIVED',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-4xl glass-panel border border-white/[0.08] shadow-glass-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Estate Governance Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Society Operations & Policy
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Greenwood Palms Residences • 240 Units • 3 Towers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
              Admin Privilege Active
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] w-fit">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Policy & Rules
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'slots'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Slot Windows & Capacity
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Immutable Audit Trail
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Scheduling Governance</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-white/60 font-medium block mb-1">Slot Cutoff Window</label>
                  <input
                    type="text"
                    defaultValue="2 Hours prior to slot start"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">
                    Reservations and cancellations lock automatically when cutoff is reached.
                  </span>
                </div>

                <div>
                  <label className="text-white/60 font-medium block mb-1">Scheduling Horizon</label>
                  <input
                    type="text"
                    defaultValue="14 Days in advance"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/60 font-medium block mb-1">Unclaimed Parcel Threshold</label>
                  <input
                    type="text"
                    defaultValue="7 Days in storage"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security & Handover Policy</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-white/60 font-medium block mb-1">OTP Validity Window</label>
                  <input
                    type="text"
                    defaultValue="15 Minutes"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/60 font-medium block mb-1">Max Failed Attempts</label>
                  <input
                    type="text"
                    defaultValue="5 Attempts before lockout"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/60 font-medium block mb-1">Reception Photo Proof</label>
                  <input
                    type="text"
                    defaultValue="Mandatory for high-value / damaged parcels"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Daily Delivery Windows</span>
              </h4>
              <button className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold flex items-center gap-1.5 transition-all">
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Add Slot Template</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="font-bold text-white text-sm">Morning Window</div>
                <div className="text-white/60">09:00 AM - 11:00 AM</div>
                <div className="text-[11px] text-primary">Capacity: 15 parcels</div>
                <div className="text-[10px] text-white/40">Active: Mon, Tue, Wed, Thu, Fri, Sat, Sun</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="font-bold text-white text-sm">Afternoon Window</div>
                <div className="text-white/60">02:00 PM - 04:00 PM</div>
                <div className="text-[11px] text-primary">Capacity: 20 parcels</div>
                <div className="text-[10px] text-white/40">Active: All 7 days</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="font-bold text-white text-sm">Evening Window</div>
                <div className="text-white/60">06:30 PM - 08:30 PM</div>
                <div className="text-[11px] text-primary">Capacity: 25 parcels</div>
                <div className="text-[10px] text-white/40">Active: All 7 days</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Append-Only Custody Log Trail</span>
            </h4>

            <div className="space-y-2 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{log.actor}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] font-mono text-[10px] text-primary">
                        {log.action}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50">
                      Parcel: <span className="font-mono text-white/80">{log.parcelCode}</span> • Method: {log.verifiedBy}
                    </div>
                  </div>

                  <span className="text-[10px] text-white/40">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

