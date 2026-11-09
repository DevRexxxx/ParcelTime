'use client';

import React from 'react';
import { Sparkles, LayoutGrid, Package, Inbox, Truck } from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
  const tabs = [
    { id: 'chat', label: 'AI Concierge', icon: Sparkles },
    { id: 'bento', label: 'Bento', icon: LayoutGrid },
    { id: 'resident', label: 'Parcels', icon: Package },
    { id: 'reception', label: 'Desk', icon: Inbox },
    { id: 'executive', label: 'Deliver', icon: Truck },
  ];

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

