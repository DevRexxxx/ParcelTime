'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, Mic, ArrowUp, Sparkles, X, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, attachment?: string) => void;
  disabled?: boolean;
  voiceActive?: boolean;
  onToggleVoice?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  voiceActive = false,
  onToggleVoice,
}) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const promptSuggestions = [
    'Schedule my Amazon delivery',
    'When is my parcel arriving today?',
    'Any packages waiting at Gate 1?',
    'Self-pickup request',
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachment) return;
    onSendMessage(input.trim(), attachment || undefined);
    setInput('');
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const simulateAttachment = () => {
    setAttachment('parcel_shipping_label_sample.png');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Quick Prompt Suggestions Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-[11px] text-white/40 shrink-0 pl-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Suggestions:</span>
        </div>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 border border-white/[0.06] text-[11px] text-white/70 hover:text-white transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Floating Search / Chat Box with Subtle Focused Border */}
      <div className="relative group">
        {/* Animated Rotating Gradient Stroke Border */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#FF5D00] via-[#9333EA] to-[#3B82F6] opacity-60 blur-[2px] group-hover:opacity-90 group-hover:blur-[3px] transition duration-700 animate-gradient-border" />

        {/* Inner Input Card */}
        <div className="relative rounded-3xl bg-[#0D0101]/95 backdrop-blur-2xl border border-white/[0.1] p-3 sm:p-4 shadow-glass-lg">
          {/* Attachment Preview (if any) */}
          {attachment && (
            <div className="mb-2 flex items-center gap-2 p-2 rounded-2xl bg-white/[0.05] border border-white/10 w-fit">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-xs text-white/80">{attachment}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1 hover:text-rose-400 text-white/40 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={simulateAttachment}
              className="p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all shrink-0"
              title="Attach courier photo or label"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={onToggleVoice}
              className={`p-2 rounded-2xl transition-all shrink-0 ${
                voiceActive
                  ? 'bg-purple-600 text-white shadow-glow-purple animate-pulse'
                  : 'bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white'
              }`}
              title="Speak to Assistant"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your parcels or bookings..."
              rows={1}
              className="flex-1 max-h-32 bg-transparent text-sm text-white placeholder-white/40 resize-none outline-none py-1.5 px-2 font-normal"
              style={{ minHeight: '36px' }}
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={disabled || (!input.trim() && !attachment)}
              className={`p-2.5 rounded-2xl font-bold flex items-center justify-center transition-all duration-300 shrink-0 ${
                input.trim() || attachment
                  ? 'bg-gradient-to-r from-primary to-[#FF7524] text-white shadow-glow-orange hover:scale-105 active:scale-95'
                  : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
