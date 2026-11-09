'use client';

import React, { useState } from 'react';
import {
  Bell,
  Search,
  Sparkles,
  ChevronDown,
  Building,
  CheckCircle2,
  Mic,
} from 'lucide-react';
import { ActiveRole } from '@/lib/types';

interface HeaderProps {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  onOpenSearch?: () => void;
  voiceActive?: boolean;
  setVoiceActive?: (active: boolean) => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  setActiveRole,
  onOpenSearch,
  voiceActive,
  setVoiceActive,
  unreadCount = 2,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ParcelTime Vision-3');
  const [notifOpen, setNotifOpen] = useState(false);

  const models = [
    { name: 'ParcelTime Vision-3', desc: 'Autonomous Spatial Concierge (Fastest)' },
    { name: 'Claude 3.5 Sonnet', desc: 'High-reasoning operations & scheduling' },
    { name: 'GPT-4o Omni', desc: 'Multimodal parcel recognition & voice' },
  ];

  const roles: { role: ActiveRole; label: string; badge: string }[] = [
    { role: 'RESIDENT', label: 'Resident (Unit A-102)', badge: 'Priya Sharma' },
    { role: 'RECEPTION', label: 'Reception Guard Desk', badge: 'Gate 1' },
    { role: 'DELIVERY_EXECUTIVE', label: 'Delivery Executive', badge: 'Rajesh Kumar' },
    { role: 'SOCIETY_ADMIN', label: 'Society Admin Suite', badge: 'Estate Manager' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-2xl bg-[#0D0101]/80 border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Society info & spatial indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Building className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-text-primary hidden sm:inline">Greenwood Palms</span>
            <span className="text-white/40 hidden md:inline">• IST</span>
          </div>

          {/* AI Model Selector Button (Admin & Staff Diagnostics only, hidden for Residents per Spec 2 & H1) */}
          {activeRole !== 'RESIDENT' && (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs transition-all text-white/90"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF5D00]" />
                <span className="font-medium">{selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>

              {modelDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 p-2 rounded-2xl glass-panel-elevated shadow-glass-lg border border-white/10 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-2.5 py-1">
                    AI Operations Engine
                  </div>
                  {models.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => {
                        setSelectedModel(m.name);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-0.5 ${
                        selectedModel === m.name
                          ? 'bg-primary/15 border border-primary/30 text-white'
                          : 'hover:bg-white/[0.05] text-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>{m.name}</span>
                        {selectedModel === m.name && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <span className="text-[11px] text-white/50">{m.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Raycast / Command style search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div
            onClick={onOpenSearch}
            className="group cursor-pointer flex items-center justify-between px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            <div className="flex items-center gap-2.5 text-xs text-white/50 group-hover:text-white/80">
              <Search className="w-3.5 h-3.5 text-primary" />
              <span>Search parcels, tracking ID, slots or OTP...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/[0.08] text-white/60 font-mono">⌘K</kbd>
          </div>
        </div>

        {/* Right: Actions, Voice, Role switch, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Mode Toggle */}
          <button
            onClick={() => setVoiceActive && setVoiceActive(!voiceActive)}
            className={`p-2 rounded-full border transition-all ${
              voiceActive
                ? 'bg-primary text-white border-primary shadow-glow-orange animate-pulse'
                : 'bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.07] border-white/[0.08]'
            }`}
            title="Toggle Spatial Voice Assistant"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-full bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.07] border border-white/[0.08] transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 p-3 rounded-2xl glass-panel-elevated shadow-glass-lg border border-white/10 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-primary">{unreadCount} unread</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-white">
                    <p className="font-semibold text-[11px] text-primary">New Parcel Arrived</p>
                    <p className="text-white/80 text-[11px] mt-0.5">Amazon package PT-8942 is waiting for delivery scheduling.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/70">
                    <p className="font-semibold text-[11px] text-white">Scheduled Delivery</p>
                    <p className="text-white/60 text-[11px] mt-0.5">Blue Dart PT-9104 scheduled for tomorrow morning.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-white/[0.05] to-white/[0.02] hover:bg-white/[0.08] border border-white/[0.1] transition-all text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                {activeRole[0]}
              </div>
              <span className="font-medium text-white/90 hidden sm:inline">
                {roles.find((r) => r.role === activeRole)?.label.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl glass-panel-elevated shadow-glass-lg border border-white/10 z-50">
                <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-2.5 py-1">
                  Active Persona
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setActiveRole(r.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between text-xs ${
                      activeRole === r.role
                        ? 'bg-primary/20 text-white font-semibold border border-primary/30'
                        : 'text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div>
                      <div>{r.label}</div>
                      <div className="text-[10px] text-white/40">{r.badge}</div>
                    </div>
                    {activeRole === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

