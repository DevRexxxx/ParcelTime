'use client';

import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatMessage, ParcelItem } from '@/lib/types';
import { Sparkles, Trash2, ShieldCheck, Info } from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, attachment?: string) => void;
  isStreaming: boolean;
  parcels: ParcelItem[];
  onOpenSchedule: (parcel: ParcelItem) => void;
  onOpenOtp: (parcel: ParcelItem) => void;
  onOpenRegister: () => void;
  onSelectSlot: (slotId: string) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  onClearChat: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  isStreaming,
  parcels: _parcels,
  onOpenSchedule,
  onOpenOtp,
  onOpenRegister: _onOpenRegister,
  onSelectSlot,
  voiceActive,
  setVoiceActive,
  onClearChat,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden relative">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header Banner */}
          <div className="flex items-center justify-between p-4 rounded-3xl glass-panel border border-white/[0.08] shadow-glass-sm text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-primary/20 text-primary border border-primary/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Residential AI Concierge</h3>
                <p className="text-[11px] text-white/50">
                  Greenwood Palms (Unit A-102) • Scoped to your household parcels
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Zero-Trust Privacy</span>
              </div>
              <button
                onClick={onClearChat}
                className="p-2 rounded-2xl hover:bg-white/[0.06] text-white/40 hover:text-rose-400 transition-all"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Privacy Notice Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-white/40">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Delivery codes and full contact details are kept secure and never stored in conversational text history.
            </span>
          </div>

          {/* Messages Stream */}
          <div className="space-y-4 pt-2 pb-6">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onSelectSlot={onSelectSlot}
                onOpenSchedule={onOpenSchedule}
                onOpenOtp={onOpenOtp}
              />
            ))}

            {/* Typing / Streaming Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-3 p-4 rounded-3xl glass-panel w-fit border border-white/[0.08] animate-pulse">
                <Sparkles className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-white/70">Concierge is checking available slots...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Floating Bottom Chat Input */}
      <div className="w-full px-4 sm:px-8 pb-5 pt-2 bg-gradient-to-t from-[#0D0101] via-[#0D0101]/95 to-transparent">
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={isStreaming}
          voiceActive={voiceActive}
          onToggleVoice={() => setVoiceActive(!voiceActive)}
        />
      </div>
    </div>
  );
};
