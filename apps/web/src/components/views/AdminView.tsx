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
  Building,
  Upload,
  Download,
  Search,
  Check,
  Ban,
} from 'lucide-react';
import { api } from '@/lib/api';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'slots' | 'units' | 'reports' | 'audit'>('settings');
  const [importText, setImportText] = useState(
    'Tower A, 1, 101\nTower A, 1, 102\nTower A, 2, 201\nTower B, 4, 401\nTower B, 4, 402'
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Slot states
  const [slots, setSlots] = useState([
    { id: 'st-1', name: 'Morning Window', time: '09:00 AM - 11:00 AM', capacity: 15, days: 'Mon - Sun', blocked: false },
    { id: 'st-2', name: 'Afternoon Window', time: '02:00 PM - 04:00 PM', capacity: 20, days: 'Mon - Sun', blocked: false },
    { id: 'st-3', name: 'Evening Window', time: '06:30 PM - 08:30 PM', capacity: 25, days: 'Mon - Sun', blocked: false },
  ]);

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

  const handleBulkImport = async () => {
    try {
      setIsImporting(true);
      setImportStatus(null);
      const lines = importText.split('\n').filter((l) => l.trim().length > 0);
      const parsed = lines.map((line) => {
        const parts = line.split(',').map((p) => p.trim());
        return {
          towerName: parts[0] || 'Tower A',
          floor: parseInt(parts[1] || '1', 10),
          unitNumber: parts[2] || '101',
        };
      });

      const res = await api.bulkImportUnits(parsed);
      setImportStatus(`Successfully verified and imported ${res.imported || parsed.length} units into society ledger!`);
    } catch (err: any) {
      setImportStatus(`Error: ${err.message || 'Import failed'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportParcelsCsv = () => {
    const csvContent =
      'Parcel Code,Courier,Tracking Number,Unit,Tower,Status,Date\n' +
      'PT-7621,Amazon,AMZ-IN-889102,402,Tower B,OUT_FOR_DELIVERY,Today 10:14 AM\n' +
      'PT-9104,Blue Dart,BLU-DEL-99214,105,Tower A,SCHEDULED,Today 09:30 AM\n' +
      'PT-8942,Delhivery,DLV-BOM-11234,301,Tower A,RECEIVED,Today 08:45 AM\n' +
      'PT-6310,DTDC,DT-PUN-55612,204,Tower B,DELIVERED,Yesterday 07:15 PM\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parceltime-audit-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSlotBlocked = (idx: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, blocked: !s.blocked } : s))
    );
  };

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
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Policy & Rules
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'slots'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Slot Windows & Capacity
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'units'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Units & Bulk CSV Import
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Reports & CSV Export
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
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
                <span>Daily Delivery Windows & Capacity</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {slots.map((s, idx) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    s.blocked
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-white/[0.03] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{s.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        s.blocked
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {s.blocked ? 'BLOCKED' : 'OPEN'}
                    </span>
                  </div>

                  <div className="text-white/60">{s.time}</div>
                  <div className="text-[11px] text-primary">Capacity: {s.capacity} parcels</div>
                  <div className="text-[10px] text-white/40">Active: {s.days}</div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => toggleSlotBlocked(idx)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1 transition-all ${
                        s.blocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-white/[0.08] hover:bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {s.blocked ? <Check className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      <span>{s.blocked ? 'Reopen Slot' : 'Block Slot'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Bulk Unit Onboarding (CSV / Delimited)</span>
              </h4>
            </div>

            <p className="text-xs text-white/60">
              Format: <span className="font-mono text-cyan-300">TowerName, FloorNumber, UnitNumber</span> (one per line). Existing towers are auto-linked.
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
              className="w-full p-3 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-white resize-none outline-none focus:border-cyan-400/50"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={handleBulkImport}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-glow-blue disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isImporting ? 'Validating & Importing...' : 'Run Bulk Import'}</span>
              </button>
            </div>

            {importStatus && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Society Performance & Audit Export</span>
                </h4>
                <p className="text-xs text-white/60 mt-1">
                  Full custody export complying with TRD 7.6 and India DPDP 2023 retention policies.
                </p>
              </div>

              <button
                onClick={handleExportParcelsCsv}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-glow-orange"
              >
                <Download className="w-4 h-4" />
                <span>Download Parcels CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[10px] text-white/50 uppercase">Total Parcels Logged</div>
                <div className="text-lg font-bold text-white mt-1">1,428</div>
                <div className="text-[10px] text-emerald-400 font-medium">This month</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[10px] text-white/50 uppercase">On-Time Handover</div>
                <div className="text-lg font-bold text-white mt-1">99.4%</div>
                <div className="text-[10px] text-emerald-400 font-medium">+0.3% vs last week</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[10px] text-white/50 uppercase">Avg Registration</div>
                <div className="text-lg font-bold text-white mt-1">21 sec</div>
                <div className="text-[10px] text-primary font-medium">Target: &lt; 30 sec</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[10px] text-white/50 uppercase">Unclaimed Overdue</div>
                <div className="text-lg font-bold text-white mt-1">0</div>
                <div className="text-[10px] text-emerald-400 font-medium">0 active alerts</div>
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
