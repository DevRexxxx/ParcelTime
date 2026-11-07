'use client';

import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { BentoGrid } from '../bento/BentoGrid';
import { ChatMessage, ParcelItem } from '@/lib/types';
import { Sparkles, ChevronDown, ChevronUp, Trash2, Download } from 'lucide-react';

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
  parcels,
  onOpenSchedule,
  onOpenOtp,
  onOpenRegister,
  onSelectSlot,
  voiceActive,
  setVoiceActive,
  onClearChat,
}) => {
  const [bentoExpanded, setBentoExpanded] = React.useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleExport = () => {
    const text = messages.map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parceltime-chat-session-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden relative">
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Collapsible Bento Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>SPATIAL OPERATIONS DASHBOARD</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBentoExpanded(!bentoExpanded)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white/60 hover:text-white transition-all"
                >
                  <span>{bentoExpanded ? 'Hide Bento' : 'Show Bento'}</span>
                  {bentoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {bentoExpanded && (
              <BentoGrid
                parcels={parcels}
                onOpenSchedule={onOpenSchedule}
                onOpenOtp={onOpenOtp}
                onOpenRegister={onOpenRegister}
                voiceActive={voiceActive}
                setVoiceActive={setVoiceActive}
                onSelectPrompt={(p) => onSendMessage(p)}
              />
            )}
          </div>

          {/* Chat Header & Utilities Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs text-white/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI CONVERSATION & SCHEDULING STREAM</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all"
                title="Export Chat History"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearChat}
                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-white/[0.06] transition-all"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="space-y-4 pb-4">
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
                <span className="text-xs text-white/70">ParcelTime AI is thinking and querying slots...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Floating Bottom Chat Input */}
      <div className="w-full px-4 sm:px-8 pb-5 pt-2 bg-gradient-to-t from-[#0D0101] via-[#0D0101]/90 to-transparent">
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

