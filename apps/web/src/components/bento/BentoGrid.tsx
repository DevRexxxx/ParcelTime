'use client';

import React, { useState } from 'react';
import {
  Package,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  LayoutGrid,
  Bot,
  Brain,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { ActiveDeliveryCard } from './ActiveDeliveryCard';
import { OtpCard } from './OtpCard';
import { VoiceCard } from './VoiceCard';
import { StorageCard } from './StorageCard';
import { ConversationStatsCard } from './ConversationStatsCard';
import { AiModelCard } from './AiModelCard';
import { MemoryCard } from './MemoryCard';
import { RecentChatsCard } from './RecentChatsCard';
import { FilesCard } from './FilesCard';
import { KnowledgeBaseCard } from './KnowledgeBaseCard';
import { WorkspaceCard } from './WorkspaceCard';
import { PromptLibraryCard } from './PromptLibraryCard';
import { SettingsCard } from './SettingsCard';
import { DocumentViewerModal } from '../modals/DocumentViewerModal';
import { ParcelItem } from '@/lib/types';

interface BentoGridProps {
  parcels: ParcelItem[];
  onOpenSchedule: (parcel: ParcelItem) => void;
  onOpenOtp: (parcel: ParcelItem) => void;
  onOpenRegister: () => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  parcels,
  onOpenSchedule,
  onOpenOtp,
  onOpenRegister,
  voiceActive,
  setVoiceActive,
  onSelectPrompt,
}) => {
  const [bentoTab, setBentoTab] = useState<'ops' | 'ai' | 'all'>('all');
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    type: string;
    size: string;
    url?: string;
  } | null>(null);

  const inStorage = parcels.filter((p) => p.status === 'RECEIVED').length;
  const scheduled = parcels.filter((p) => p.status === 'SCHEDULED').length;
  const outForDelivery = parcels.filter((p) => p.status === 'OUT_FOR_DELIVERY').length;
  const activeInTransit = parcels.find((p) => p.status === 'OUT_FOR_DELIVERY');

  return (
    <div className="w-full space-y-4">
      {/* Top Banner & Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="In Storage Vault"
          value={inStorage}
          subtext="Eligible for scheduled delivery"
          icon={Package}
          trend="+2 today"
          glowColor="orange"
        />
        <StatCard
          title="Scheduled Slots"
          value={scheduled}
          subtext="Confirmed with residents"
          icon={Clock}
          glowColor="blue"
        />
        <StatCard
          title="Out For Delivery"
          value={outForDelivery}
          subtext="Live with courier personnel"
          icon={Zap}
          trend="Live"
          glowColor="orange"
        />
        <StatCard
          title="Delivery Success"
          value="99.4%"
          subtext="OTP verified handovers"
          icon={ShieldCheck}
          glowColor="purple"
        />
      </div>

      {/* Bento Mode Switcher Pill */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] w-fit">
          <button
            onClick={() => setBentoTab('all')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              bentoTab === 'all'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All Bento Cards
          </button>
          <button
            onClick={() => setBentoTab('ops')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              bentoTab === 'ops'
                ? 'bg-primary text-white shadow-glow-orange'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Delivery & Storage
          </button>
          <button
            onClick={() => setBentoTab('ai')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              bentoTab === 'ai'
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'text-white/60 hover:text-white'
            }`}
          >
            AI Models & Workspace
          </button>
        </div>
        <span className="text-[11px] text-white/40 hidden sm:inline">
          Spatial 3D Cards • VisionOS 2030
        </span>
      </div>

      {/* Operational Bento Grid Section */}
      {(bentoTab === 'ops' || bentoTab === 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in">
          {/* Card 1: Active Delivery tracking */}
          <ActiveDeliveryCard
            parcel={activeInTransit}
            onViewOtp={() => activeInTransit && onOpenOtp(activeInTransit)}
          />

          {/* Card 2: Handover Code display */}
          <OtpCard
            code={activeInTransit?.otpCode || '482910'}
            parcelCode={activeInTransit?.parcelCode || 'PT-7621'}
          />

          {/* Card 3: Spatial Voice Assistant */}
          <VoiceCard
            isActive={voiceActive}
            onToggle={() => setVoiceActive(!voiceActive)}
          />

          {/* Card 4: Society Storage Occupancy */}
          <StorageCard />

          {/* Card 5: Quick Prompt Actions & Shortcuts */}
          <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="uppercase text-[10px] tracking-wider font-semibold text-primary">
                Instant Operations
              </span>
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2 space-y-1.5">
              <button
                onClick={onOpenRegister}
                className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-white flex items-center justify-between group transition-all"
              >
                <span>Scan & Register Inbound Parcel</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </button>
              <button
                onClick={() => {
                  const p = parcels.find((p) => p.status === 'RECEIVED');
                  if (p) onOpenSchedule(p);
                }}
                className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-white flex items-center justify-between group transition-all"
              >
                <span>Schedule Delivery Window</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </button>
            </div>
            <div className="text-[10px] text-white/40">
              Connected to 4 courier gateways: Amazon, Blue Dart, Delhivery, DTDC
            </div>
          </div>

          {/* Card 6: Workspace Overview Card */}
          <WorkspaceCard />
        </div>
      )}

      {/* AI & Spatial Grid Section */}
      {(bentoTab === 'ai' || bentoTab === 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in">
          {/* Card 7: AI Models Selector */}
          <AiModelCard />

          {/* Card 8: Conversation Stats */}
          <ConversationStatsCard />

          {/* Card 9: Active Spatial Memory */}
          <MemoryCard />

          {/* Card 10: Recent Chats */}
          <RecentChatsCard onSelectChat={(title) => onSelectPrompt?.(`Query: ${title}`)} />

          {/* Card 11: Files & Documents with Preview Modal */}
          <FilesCard onOpenFilePreview={(f) => setPreviewFile(f)} />

          {/* Card 12: Knowledge Base */}
          <KnowledgeBaseCard />

          {/* Card 13: Prompt Library */}
          <PromptLibraryCard onExecutePrompt={(p) => onSelectPrompt?.(p)} />

          {/* Card 14: Settings Card */}
          <SettingsCard />
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
