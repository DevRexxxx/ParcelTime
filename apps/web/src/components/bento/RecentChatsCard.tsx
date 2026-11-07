'use client';

import React from 'react';
import { MessageSquare, ArrowUpRight, Clock } from 'lucide-react';

interface RecentChatsCardProps {
  onSelectChat?: (title: string) => void;
}

export const RecentChatsCard: React.FC<RecentChatsCardProps> = ({ onSelectChat }) => {
  const recentChats = [
    { title: 'Amazon Laptop delivery reschedule', time: '10m ago', unread: false },
    { title: 'Request Handover OTP for Bluedart', time: '1h ago', unread: false },
    { title: 'Gate intake batch query (8 items)', time: 'Yesterday', unread: true },
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="font-semibold tracking-wider text-[10px] uppercase text-blue-400 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          Recent Chats
        </span>
        <span className="text-[10px] text-white/40 font-mono">History</span>
      </div>

      <div className="space-y-2 mb-3">
        {recentChats.map((chat, idx) => (
          <div
            key={idx}
            onClick={() => onSelectChat?.(chat.title)}
            className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] cursor-pointer flex items-center justify-between group/chat transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 opacity-70 group-hover/chat:opacity-100" />
              <span className="text-xs text-white/80 group-hover/chat:text-white truncate font-medium">
                {chat.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-white/40 font-mono">
              <Clock className="w-3 h-3 text-white/30" />
              <span>{chat.time}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/chat:opacity-100 text-primary transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
        <span>3 archived conversations</span>
        <span className="text-primary text-[10px] cursor-pointer hover:underline">View all</span>
      </div>
    </div>
  );
};

