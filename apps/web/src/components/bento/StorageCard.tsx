'use client';

import React from 'react';
import { Box, Layers, HardDrive } from 'lucide-react';

export const StorageCard: React.FC = () => {
  const vaults = [
    { name: 'Storage Vault - Shelf A', capacity: 80, used: 38, pct: 47 },
    { name: 'Front Reception Counter', capacity: 30, used: 8, pct: 27 },
    { name: 'Smart Locker Bay 1', capacity: 40, used: 26, pct: 65 },
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-white">Society Storage Vault</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-medium">72 Units Free</span>
      </div>

      <div className="my-3 space-y-2.5">
        {vaults.map((vault) => (
          <div key={vault.name} className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-white/70 truncate">{vault.name}</span>
              <span className="text-white/40 font-mono">
                {vault.used}/{vault.capacity} ({vault.pct}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  vault.pct > 70
                    ? 'bg-rose-500'
                    : vault.pct > 40
                    ? 'bg-blue-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${vault.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/[0.06]">
        <span>Auto-aging alert: 7 days</span>
        <span className="text-primary hover:underline cursor-pointer">Reassign Vault</span>
      </div>
    </div>
  );
};

