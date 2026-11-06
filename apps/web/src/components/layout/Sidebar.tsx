'use client';

import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  Package,
  Inbox,
  Truck,
  ShieldCheck,
  History,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Plus,
  Box,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { ActiveRole } from '@/lib/types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeRole: ActiveRole;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  activeRole,
  onNewChat,
}) => {
  const navItems = [
    { id: 'chat', label: 'AI Concierge', icon: Sparkles, badge: 'Vision' },
    { id: 'bento', label: 'Operations Bento', icon: LayoutGrid, badge: 'Live' },
    { id: 'resident', label: 'Resident Portal', icon: Package },
    { id: 'reception', label: 'Reception Desk', icon: Inbox },
    { id: 'executive', label: 'Executive Console', icon: Truck },
    { id: 'admin', label: 'Society Admin', icon: ShieldCheck },
  ];

  const recentPrompts = [
    'Schedule Amazon PT-8942 for 7 PM',
    'Show my handover OTP code',
    'Register incoming Blue Dart package',
    'Storage vault occupancy report',
  ];

  return (
    <aside
      className={`relative hidden md:flex flex-col justify-between transition-all duration-300 ease-in-out p-3.5 my-4 ml-4 rounded-3xl glass-panel border border-white/[0.08] shadow-glass-lg ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="space-y-4">
        {/* Brand & Collapse */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[#FF8C38] flex items-center justify-center shadow-glow-orange shrink-0">
              <Box className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  ParcelTime
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    2030
                  </span>
                </span>
                <span className="text-[11px] text-white/40">Spatial Logistics</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat / Request Button */}
        <button
          onClick={onNewChat}
          className={`w-full py-2.5 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-glow-orange hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] ${
            collapsed ? 'px-0' : 'px-3'
          }`}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Instruction</span>}
        </button>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-xs font-medium ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-glow-orange/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-white/60'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pinned / Recent Prompts (Visible when expanded) */}
        {!collapsed && (
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              <History className="w-3 h-3" />
              <span>Recent Tasks</span>
            </div>
            <div className="space-y-1">
              {recentPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveView('chat');
                  }}
                  className="w-full text-left truncate px-2.5 py-1.5 rounded-xl text-[11px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile & Settings */}
      <div className="pt-3 border-t border-white/[0.06] space-y-1">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
            PS
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-white truncate">Priya Sharma</div>
              <div className="text-[10px] text-white/40 truncate">Unit A-102 • Owner</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

