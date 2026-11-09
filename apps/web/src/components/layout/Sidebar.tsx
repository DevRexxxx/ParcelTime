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
  ChevronLeft,
  ChevronRight,
  Plus,
  Box,
} from 'lucide-react';
import { ActiveRole } from '@/lib/types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeRole: ActiveRole;
  onNewChat: () => void;
  onOpenSchedule?: () => void;
  onOpenRegister?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  activeRole,
  onNewChat,
  onOpenSchedule,
  onOpenRegister,
}) => {
  // Role-filtered navigation items (Spec Section 3 & 11.1)
  const getNavItems = () => {
    switch (activeRole) {
      case 'RESIDENT':
        return [
          { id: 'resident', label: 'Resident Home', icon: Package },
          { id: 'bento', label: 'Operations Bento', icon: LayoutGrid, badge: 'Live' },
          { id: 'chat', label: 'AI Concierge', icon: Sparkles, badge: 'Vision' },
        ];
      case 'RECEPTION':
        return [
          { id: 'reception', label: 'Reception Concierge Desk', icon: Inbox, badge: 'Gate 1' },
          { id: 'bento', label: 'Operations Bento', icon: LayoutGrid },
          { id: 'chat', label: 'AI Concierge', icon: Sparkles },
        ];
      case 'DELIVERY_EXECUTIVE':
        return [
          { id: 'executive', label: 'Executive Run Sheet', icon: Truck, badge: 'Route' },
          { id: 'bento', label: 'Operations Bento', icon: LayoutGrid },
        ];
      case 'SOCIETY_ADMIN':
      default:
        return [
          { id: 'admin', label: 'Society Governance', icon: ShieldCheck, badge: 'Admin' },
          { id: 'reception', label: 'Reception Desk', icon: Inbox },
          { id: 'bento', label: 'Operations Bento', icon: LayoutGrid },
          { id: 'chat', label: 'AI Concierge', icon: Sparkles },
        ];
    }
  };

  const navItems = getNavItems();

  const getPrimaryAction = () => {
    switch (activeRole) {
      case 'RESIDENT':
        return {
          label: 'Schedule Delivery',
          onClick: onOpenSchedule || (() => setActiveView('resident')),
        };
      case 'RECEPTION':
        return {
          label: 'Register Inbound',
          onClick: onOpenRegister || (() => setActiveView('reception')),
        };
      case 'DELIVERY_EXECUTIVE':
        return {
          label: 'Today\'s Route',
          onClick: () => setActiveView('executive'),
        };
      case 'SOCIETY_ADMIN':
      default:
        return {
          label: 'Society Overview',
          onClick: () => setActiveView('admin'),
        };
    }
  };

  const primaryAction = getPrimaryAction();

  const recentActivity = activeRole === 'RESIDENT'
    ? [
        'Amazon PT-8942 waiting at Gate 1',
        'Delhivery PT-7621 on its way',
        'DTDC PT-6310 delivered yesterday',
      ]
    : [
        'Gate 1 check-in: 4 packages logged',
        'Shift route assigned to Rajesh Kumar',
        'Vault Shelf A at 47% occupancy',
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-[#FF8C38] flex items-center justify-center shadow-glow-orange shrink-0">
              <Box className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>ParcelTime</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono border border-primary/30">
                    2030
                  </span>
                </h1>
                <p className="text-[11px] text-white/50 tracking-wider">Spatial Logistics</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action Pill Button */}
        <button
          onClick={primaryAction.onClick}
          className={`w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-primary to-[#FF701A] hover:brightness-110 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-orange transition-all hover:scale-102 active:scale-98 ${
            collapsed ? 'px-0' : ''
          }`}
          title={primaryAction.label}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          {!collapsed && <span>{primaryAction.label}</span>}
        </button>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-glow-orange/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive ? 'bg-primary text-white' : 'bg-white/[0.06] text-white/40'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Recent Activity */}
      {!collapsed && (
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-white/40 px-2 font-medium">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Recent Activity</span>
            </div>
            <button onClick={onNewChat} className="text-primary hover:underline text-[10px]">
              New session
            </button>
          </div>
          <div className="space-y-1">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="w-full text-left p-2 rounded-xl text-[11px] text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors truncate"
              >
                {activity}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
