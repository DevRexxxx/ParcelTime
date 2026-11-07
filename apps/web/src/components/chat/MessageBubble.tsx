'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Share2,
  Package,
  Calendar,
  ShieldCheck,
  Clock,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { ChatMessage, ParcelItem } from '@/lib/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onSelectSlot?: (slotId: string) => void;
  onOpenSchedule?: (parcel: ParcelItem) => void;
  onOpenOtp?: (parcel: ParcelItem) => void;
  onRegenerate?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectSlot,
  onOpenSchedule,
  onOpenOtp,
  onRegenerate,
}) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ParcelTime Delivery Update',
          text: message.content,
        });
      } catch (err) {
        // Fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Basic Markdown parser for bold, inline code, and code blocks
  const renderFormattedContent = (content: string) => {
    if (content.includes('```')) {
      const parts = content.split(/(```[\s\S]*?```)/g);
      return parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const lang = lines[0].match(/^[a-z]+/i) ? lines[0] : '';
          const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
          return (
            <div key={i} className="my-2 rounded-2xl bg-black/60 border border-white/10 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.06] text-[10px] text-white/50">
                <span className="flex items-center gap-1.5 text-primary">
                  <Code2 className="w-3 h-3" />
                  {lang || 'code'}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="hover:text-white transition-colors"
                >
                  Copy code
                </button>
              </div>
              <pre className="p-3 text-emerald-300 overflow-x-auto whitespace-pre">{code}</pre>
            </div>
          );
        }
        return <span key={i} className="whitespace-pre-wrap">{formatInline(part)}</span>;
      });
    }

    return <div className="whitespace-pre-wrap">{formatInline(content)}</div>;
  };

  const formatInline = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  return (
    <div
      className={`flex w-full mb-6 ${
        isUser ? 'justify-end' : 'justify-start'
      } animate-in fade-in slide-in-from-bottom-2`}
    >
      <div className={`flex gap-3 max-w-2xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-glass-sm border transition-all ${
            isUser
              ? 'bg-gradient-to-tr from-primary to-[#FF8C38] border-primary/40 text-white'
              : 'glass-panel border-white/10 text-primary'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Message Card Container */}
        <div className="flex flex-col gap-2">
          <div
            className={`p-4 sm:p-5 rounded-3xl transition-all ${
              isUser
                ? 'bg-gradient-to-br from-[#FF5D00] to-[#E04F00] text-white shadow-glow-orange/20 border border-primary/50'
                : 'glass-panel border border-white/[0.08] text-text-primary shadow-glass'
            }`}
          >
            {/* Message Content */}
            <div className="text-sm leading-relaxed font-normal">
              {renderFormattedContent(message.content)}
            </div>

            {/* Action Cards inside Assistant Response */}
            {!isUser && message.actionCard && (
              <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-3">
                {/* Parcel list card */}
                {message.actionCard.type === 'PARCEL_LIST' && (
                  <div className="space-y-2">
                    {message.actionCard.data.map((parcel: ParcelItem) => (
                      <div
                        key={parcel.id}
                        className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <span>{parcel.courier}</span>
                              <span className="font-mono text-white/50">({parcel.parcelCode})</span>
                            </div>
                            <div className="text-[11px] text-white/50">{parcel.storageLocation}</div>
                          </div>
                        </div>

                        {parcel.status === 'RECEIVED' && onOpenSchedule && (
                          <button
                            onClick={() => onOpenSchedule(parcel)}
                            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-medium flex items-center gap-1 shadow-glow-orange transition-all"
                          >
                            <span>Schedule</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {parcel.status === 'OUT_FOR_DELIVERY' && onOpenOtp && (
                          <button
                            onClick={() => onOpenOtp(parcel)}
                            className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-semibold flex items-center gap-1 animate-pulse transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>View OTP</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Slot Picker */}
                {message.actionCard.type === 'SLOT_PICKER' && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-white/50 font-medium">
                      Select an available delivery window:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {message.actionCard.data.map((slot: any) => (
                        <button
                          key={slot.id}
                          onClick={() => onSelectSlot && onSelectSlot(slot.id)}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-primary/15 hover:border-primary/40 border border-white/[0.08] text-left transition-all group"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-primary">
                            <span>{slot.label}</span>
                            <Clock className="w-3 h-3 text-white/40 group-hover:text-primary" />
                          </div>
                          <div className="text-[11px] text-white/50 mt-0.5">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* OTP Display Card */}
                {message.actionCard.type === 'OTP_DISPLAY' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">
                        One-Time Handover Code
                      </span>
                      <div className="text-2xl font-mono font-bold tracking-widest text-white mt-0.5">
                        {message.actionCard.data.code}
                      </div>
                      <span className="text-[10px] text-white/40">Give only when courier arrives</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Micro Action Buttons (Assistant only) */}
          {!isUser && (
            <div className="flex items-center gap-1 px-2 text-white/40">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setLiked(true)}
                className={`p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all ${
                  liked === true ? 'text-primary' : ''
                }`}
                title="Helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLiked(false)}
                className={`p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all ${
                  liked === false ? 'text-rose-400' : ''
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all"
                title="Share update"
              >
                {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[10px] ml-2 text-white/30">{message.timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
