'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ChatArea } from '@/components/chat/ChatArea';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { ResidentView } from '@/components/views/ResidentView';
import { ReceptionView } from '@/components/views/ReceptionView';
import { ExecutiveView } from '@/components/views/ExecutiveView';
import { AdminView } from '@/components/views/AdminView';
import { RegisterParcelModal } from '@/components/modals/RegisterParcelModal';
import { ScheduleSlotModal } from '@/components/modals/ScheduleSlotModal';
import { VerifyOtpModal } from '@/components/modals/VerifyOtpModal';
import { INITIAL_PARCELS, INITIAL_SLOTS } from '@/lib/mockData';
import { ActiveRole, ChatMessage, ParcelItem, SlotItem } from '@/lib/types';

export default function HomePage() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('RESIDENT');
  const [activeView, setActiveView] = useState<string>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);

  // Data states
  const [parcels, setParcels] = useState<ParcelItem[]>(INITIAL_PARCELS);
  const [slots, setSlots] = useState<SlotItem[]>(INITIAL_SLOTS);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedParcelForSchedule, setSelectedParcelForSchedule] = useState<ParcelItem | null>(null);
  const [parcelsForConsolidation, setParcelsForConsolidation] = useState<ParcelItem[] | null>(null);
  const [selectedParcelForOtp, setSelectedParcelForOtp] = useState<ParcelItem | null>(null);

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content:
        'Hello Priya! Welcome to **ParcelTime Spatial AI**. I am your residential parcel concierge for **Greenwood Palms (Unit A-102)**.\n\nYour **Amazon Logistics** package (PT-8942) arrived at the reception desk and is ready to be scheduled. Your **Delhivery** package (PT-7621) is currently out for delivery with executive Rajesh Kumar.',
      timestamp: 'Just now',
      actionCard: {
        type: 'PARCEL_LIST',
        data: parcels.filter((p) => p.status === 'RECEIVED' || p.status === 'OUT_FOR_DELIVERY'),
      },
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  // AI Response generator
  const handleSendMessage = (text: string, attachment?: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: attachment ? `${text}\n[Attached: ${attachment}]` : text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const lower = text.toLowerCase();

    setTimeout(() => {
      let replyContent = '';
      let actionCard: any = undefined;

      if (lower.includes('otp') || lower.includes('code') || lower.includes('handover')) {
        const outParcel = parcels.find((p) => p.status === 'OUT_FOR_DELIVERY');
        if (outParcel) {
          replyContent = `Your delivery code for **${outParcel.courier} (${outParcel.parcelCode})** is ready for doorstep handover. Per society security rules, codes are never printed in chat text or saved in history. Tap below to open your secure delivery sheet.`;
          actionCard = {
            type: 'OTP_ACTION',
            data: { parcel: outParcel },
          };
        } else {
          replyContent = 'You currently have no packages out for delivery requiring a delivery code.';
        }
      } else if (lower.includes('consolidat') || lower.includes('bundle') || lower.includes('all packages')) {
        const received = parcels.filter((p) => p.status === 'RECEIVED');
        if (received.length >= 2) {
          replyContent = `Found **${received.length} pending packages** for Unit A-102 (${received.map((p) => p.parcelCode).join(', ')}). Using deterministic AI scheduling, I recommend the **Morning Window (09:00 - 11:00 AM)** because you already have PT-9104 arriving then — consolidating delivers all packages together in a single run!`;
          actionCard = {
            type: 'SLOT_PICKER',
            data: slots.filter((s) => s.isAvailable),
          };
        } else {
          replyContent = 'You currently have 1 pending package. When additional packages arrive at Gate 1, they will be auto-clustered into a consolidated batch.';
        }
      } else if (lower.includes('kpi') || lower.includes('dwell') || lower.includes('metric') || lower.includes('telemetry')) {
        replyContent = `📊 **Society Pilot Operational KPIs (Roadmap Section 10):**\n- **Consolidation Rate:** 34.2% of multi-parcel deliveries bundled into single runs\n- **Median Storage Dwell Time:** 4.2 hours\n- **First-Attempt Handover Rate:** 99.4% (OTP verified)\n- **Intake Speed:** 38 seconds per parcel\n- **Dispute Frequency:** 1.2 per 1,000 handovers.`;
      } else if (lower.includes('schedule') || lower.includes('book') || lower.includes('slot')) {
        replyContent =
          'I found your pending **Amazon Logistics** parcel (PT-8942) in Shelf A. Here are the open delivery windows for tomorrow:';
        actionCard = {
          type: 'SLOT_PICKER',
          data: slots.filter((s) => s.isAvailable),
        };
      } else if (lower.includes('parcels') || lower.includes('status') || lower.includes('arrived')) {
        replyContent = `You have ${parcels.length} total parcels on record. Here is your active status:`;
        actionCard = {
          type: 'PARCEL_LIST',
          data: parcels,
        };
      } else if (lower.includes('pickup') || lower.includes('counter')) {
        replyContent =
          'I have recorded a **Self-Pickup Request** for your package. The reception guard will hold it at the front counter. Please bring a valid ID or show your parcel QR badge upon arrival.';
      } else {
        replyContent = `I understand you want to "${text}". As your ParcelTime concierge, I can book delivery slots, retrieve handover OTP codes, check society vault storage, or register inbound packages. How would you like me to proceed?`;
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        content: replyContent,
        timestamp: 'Just now',
        actionCard,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);
    }, 800);
  };

  const handleSelectSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;

    // Book first received parcel
    const targetParcel = parcels.find((p) => p.status === 'RECEIVED') || parcels[0];
    handleConfirmSchedule(targetParcel.id, slot, 'Booked via AI Assistant');

    const confirmMsg: ChatMessage = {
      id: `asst-conf-${Date.now()}`,
      sender: 'assistant',
      content: `🎉 Confirmed! Your parcel **${targetParcel.courier} (${targetParcel.parcelCode})** is scheduled for **${slot.label} (${slot.date}, ${slot.startTime} - ${slot.endTime})**. We will notify you when the executive leaves the storage vault.`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  const handleConfirmSchedule = (parcelId: string, slot: SlotItem, note?: string) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              status: 'SCHEDULED',
              scheduledTime: `${slot.date}, ${slot.startTime} - ${slot.endTime}`,
              notes: note || p.notes,
            }
          : p
      )
    );
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, bookedCount: s.bookedCount + 1 } : s))
    );
  };

  const handleConfirmConsolidatedSchedule = (parcelIds: string[], slot: SlotItem, note?: string) => {
    setParcels((prev) =>
      prev.map((p) =>
        parcelIds.includes(p.id)
          ? {
              ...p,
              status: 'SCHEDULED',
              scheduledTime: `${slot.date}, ${slot.startTime} - ${slot.endTime}`,
              isConsolidated: true,
              consolidatedWith: parcelIds.filter((id) => id !== p.id),
              notes: note || p.notes,
            }
          : p
      )
    );
    // Consolidating multiple parcels into 1 delivery run consumes 1 slot booking!
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, bookedCount: s.bookedCount + 1 } : s))
    );

    const targetParcels = parcels.filter((p) => parcelIds.includes(p.id));
    const codes = targetParcels.map((p) => p.parcelCode).join(', ');

    const confirmMsg: ChatMessage = {
      id: `asst-consol-${Date.now()}`,
      sender: 'assistant',
      content: `📦✨ **Consolidated Run Confirmed!** Your ${parcelIds.length} parcels (${codes}) are grouped into a single delivery run for **${slot.label} (${slot.date}, ${slot.startTime} - ${slot.endTime})**. The executive will deliver all items in one doorstep visit.`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  const handleRequestSelfPickup = (parcelId: string, receiverName?: string) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              fulfillmentMode: 'SELF_PICKUP',
              storageLocation: 'Gate 1 Front Desk (Ready for Pickup)',
              authorizedReceiver: receiverName || 'Resident (Self)',
            }
          : p
      )
    );

    const targetParcel = parcels.find((p) => p.id === parcelId);
    const pickupMsg: ChatMessage = {
      id: `asst-pickup-${Date.now()}`,
      sender: 'assistant',
      content: `🏢 **Gate 1 Self-Pickup Confirmed:** Parcel **${targetParcel?.courier} (${targetParcel?.parcelCode})** is registered for front-desk collection. Authorized collector: **${receiverName || 'Resident'}**. Present your QR badge or photo ID at Gate 1 security.`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, pickupMsg]);
  };

  const handleRegisterParcel = (newParcelData: Partial<ParcelItem>) => {
    const parcel: ParcelItem = {
      id: newParcelData.id || `p-${Date.now()}`,
      parcelCode: newParcelData.parcelCode || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      courier: newParcelData.courier || 'Inbound Courier',
      trackingNumber: newParcelData.trackingNumber || `TRK-${Date.now()}`,
      unitNumber: newParcelData.unitNumber || '102',
      tower: newParcelData.tower || 'Tower A',
      recipientName: newParcelData.recipientName || 'Resident',
      status: 'RECEIVED',
      storageLocation: newParcelData.storageLocation || 'Storage Vault - Shelf A',
      receivedAt: 'Just now',
      notes: newParcelData.notes,
    };

    setParcels((prev) => [parcel, ...prev]);

    // Send AI notification in chat
    const alertMsg: ChatMessage = {
      id: `alert-${Date.now()}`,
      sender: 'assistant',
      content: `📦 **New Parcel Registered:** ${parcel.courier} package (${parcel.parcelCode}) for Unit ${parcel.unitNumber} has been logged in ${parcel.storageLocation}.`,
      timestamp: 'Just now',
      actionCard: {
        type: 'PARCEL_LIST',
        data: [parcel],
      },
    };
    setMessages((prev) => [...prev, alertMsg]);
  };

  const handleStartDelivery = (parcel: ParcelItem) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === parcel.id
          ? {
              ...p,
              status: 'OUT_FOR_DELIVERY',
              otpCode: p.otpCode || Math.floor(100000 + Math.random() * 900000).toString(),
            }
          : p
      )
    );
  };

  const handleVerifyOtpSuccess = (parcelId: string) => {
    setParcels((prev) =>
      prev.map((p) => (p.id === parcelId ? { ...p, status: 'DELIVERED' } : p))
    );

    const successMsg: ChatMessage = {
      id: `success-${Date.now()}`,
      sender: 'assistant',
      content: `✅ **Handover Complete:** Parcel ${parcelId} has been successfully verified via OTP and marked **DELIVERED**. Thank you!`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, successMsg]);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `fresh-${Date.now()}`,
        sender: 'assistant',
        content:
          'New session started. How can I assist you with Greenwood Palms parcel operations today?',
        timestamp: 'Just now',
      },
    ]);
  };

  const handleRoleChange = (role: ActiveRole) => {
    setActiveRole(role);
    if (role === 'RESIDENT') setActiveView('resident');
    else if (role === 'RECEPTION') setActiveView('reception');
    else if (role === 'DELIVERY_EXECUTIVE') setActiveView('executive');
    else if (role === 'SOCIETY_ADMIN') setActiveView('admin');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <Header
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        onOpenSearch={() => setActiveView('chat')}
        voiceActive={voiceActive}
        setVoiceActive={setVoiceActive}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 max-w-[1700px] w-full mx-auto">
        {/* Floating Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          activeRole={activeRole}
          onNewChat={handleNewChat}
          onOpenSchedule={() => {
            const p = parcels.find((p) => p.status === 'RECEIVED');
            if (p) setSelectedParcelForSchedule(p);
            else setActiveView('resident');
          }}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {activeView === 'chat' && (
            <ChatArea
              messages={messages}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              parcels={parcels}
              onOpenSchedule={(parcel) => setSelectedParcelForSchedule(parcel)}
              onOpenOtp={(parcel) => setSelectedParcelForOtp(parcel)}
              onOpenRegister={() => setIsRegisterOpen(true)}
              onSelectSlot={handleSelectSlot}
              voiceActive={voiceActive}
              setVoiceActive={setVoiceActive}
              onClearChat={() => setMessages([])}
            />
          )}

          {activeView === 'bento' && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="p-6 rounded-4xl glass-panel border border-white/[0.08]">
                  <h2 className="text-xl font-bold text-white">Full Bento Grid Operations Suite</h2>
                  <p className="text-xs text-white/50 mt-1">
                    Spatial telemetry, storage vaults, courier arrivals, and active transit pipelines.
                  </p>
                </div>
                <BentoGrid
                  parcels={parcels}
                  onOpenSchedule={(parcel) => setSelectedParcelForSchedule(parcel)}
                  onOpenOtp={(parcel) => setSelectedParcelForOtp(parcel)}
                  onOpenRegister={() => setIsRegisterOpen(true)}
                  voiceActive={voiceActive}
                  setVoiceActive={setVoiceActive}
                />
              </div>
            </div>
          )}

          {activeView === 'resident' && (
            <ResidentView
              parcels={parcels}
              onOpenSchedule={(parcel) => {
                setParcelsForConsolidation(null);
                setSelectedParcelForSchedule(parcel);
              }}
              onOpenConsolidatedSchedule={(bundle) => {
                setParcelsForConsolidation(bundle);
                setSelectedParcelForSchedule(bundle[0]);
              }}
              onOpenOtp={(parcel) => setSelectedParcelForOtp(parcel)}
              onRequestSelfPickup={handleRequestSelfPickup}
            />
          )}

          {activeView === 'reception' && (
            <ReceptionView
              parcels={parcels}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
          )}

          {activeView === 'executive' && (
            <ExecutiveView
              parcels={parcels}
              onStartDelivery={handleStartDelivery}
              onOpenVerifyOtp={(parcel) => setSelectedParcelForOtp(parcel)}
            />
          )}

          {activeView === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Floating Bottom Navigation on Mobile */}
      <MobileNav activeView={activeView} setActiveView={setActiveView} activeRole={activeRole} />

      {/* Modals */}
      <RegisterParcelModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegisterParcel}
        existingParcels={parcels}
      />

      <ScheduleSlotModal
        isOpen={selectedParcelForSchedule !== null}
        onClose={() => {
          setSelectedParcelForSchedule(null);
          setParcelsForConsolidation(null);
        }}
        parcel={selectedParcelForSchedule}
        parcelsToConsolidate={parcelsForConsolidation || undefined}
        slots={slots}
        onConfirm={handleConfirmSchedule}
        onConfirmConsolidated={handleConfirmConsolidatedSchedule}
      />

      <VerifyOtpModal
        isOpen={selectedParcelForOtp !== null}
        onClose={() => setSelectedParcelForOtp(null)}
        parcel={selectedParcelForOtp}
        onSuccess={handleVerifyOtpSuccess}
      />
    </div>
  );
}

