'use client';

import React from 'react';
import { Sparkles, LayoutGrid, Package, Inbox, Truck, ShieldCheck } from 'lucide-react';
import { ActiveRole } from '@/lib/types';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeRole?: ActiveRole;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  setActiveView,
  activeRole = 'RESIDENT',
}) => {
  const getTabs = () => {
    switch (activeRole) {
      case 'RESIDENT':
        return [
          { id: 'resident', label: 'Home', icon: Package },
          { id: 'bento', label: 'Bento', icon: LayoutGrid },
          { id: 'chat', label: 'Concierge', icon: Sparkles },
        ];
      case 'RECEPTION':
        return [
          { id: 'reception', label: 'Desk', icon: Inbox },
          { id: 'bento', label: 'Bento', icon: LayoutGrid },
          { id: 'chat', label: 'Concierge', icon: Sparkles },
        ];
      case 'DELIVERY_EXECUTIVE':
        return [
          { id: 'executive', label: 'Route', icon: Truck },
          { id: 'bento', label: 'Bento', icon: LayoutGrid },
        ];
      case 'SOCIETY_ADMIN':
      default:
        return [
          { id: 'admin', label: 'Admin', icon: ShieldCheck },
          { id: 'reception', label: 'Desk', icon: Inbox },
          { id: 'bento', label: 'Bento', icon: LayoutGrid },
          { id: 'chat', label: 'Concierge', icon: Sparkles },
        ];
    }
  };

  const tabs = getTabs();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="flex items-center justify-around p-2 rounded-3xl glass-panel-elevated border border-white/10 shadow-glass-lg backdrop-blur-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-primary bg-primary/15 font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
