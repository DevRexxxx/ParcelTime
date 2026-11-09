export type ActiveRole = 'RESIDENT' | 'RECEPTION' | 'DELIVERY_EXECUTIVE' | 'SOCIETY_ADMIN' | 'PLATFORM_ADMIN';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionCard?: {
    type: 'PARCEL_LIST' | 'SLOT_PICKER' | 'OTP_DISPLAY' | 'OTP_ACTION' | 'DELIVERY_STATUS' | 'CONFIRMATION';
    data: any;
  };
}

export interface ParcelItem {
  id: string;
  parcelCode: string;
  courier: string;
  trackingNumber: string;
  unitNumber: string;
  tower: string;
  recipientName: string;
  status: 'RECEIVED' | 'SCHEDULED' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'UNCLAIMED';
  storageLocation: string;
  receivedAt: string;
  scheduledTime?: string;
  otpCode?: string;
  notes?: string;
}

export interface SlotItem {
  id: string;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export interface DeliveryTaskItem {
  id: string;
  parcelCode: string;
  courier: string;
  unit: string;
  residentName: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'FAILED';
  executiveName?: string;
  slotWindow: string;
}

